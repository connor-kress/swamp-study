import { FastifyInstance } from "fastify";
import {
  Group,
  GroupSchema,
  GroupWithMemberCount,
  GroupWithMemberCountSchema,
  GroupWithMembers,
  GroupWithMembersSchema,
  NewGroupInput,
  UserGroup,
  UserGroupRole,
  UserGroupSchema,
  UserWithGroupRole,
  UserWithGroupRoleSchema,
} from "../types";

export async function getAllGroups(
  server: FastifyInstance,
): Promise<Group[]> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, name, course_id, year, term, contact_details,
             meeting_day, meeting_time, meeting_location, created_at
      FROM groups
      ORDER BY year DESC, term DESC, course_id DESC, id DESC
    `);
    return GroupSchema.array().parse(rows);
  } finally {
    client.release();
  }
}

export async function getAllGroupsWithMemberCounts(
  server: FastifyInstance,
): Promise<GroupWithMemberCount[]> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT
        g.id,
        g.name,
        g.course_id,
        g.year,
        g.term,
        g.contact_details,
        g.meeting_day,
        g.meeting_time,
        g.meeting_location,
        g.created_at,
        COUNT(ug.user_id) AS member_count
      FROM groups g
      LEFT JOIN user_groups ug ON ug.group_id = g.id
      GROUP BY
        g.id,
        g.name,
        g.course_id,
        g.year,
        g.term,
        g.contact_details,
        g.meeting_day,
        g.meeting_time,
        g.meeting_location,
        g.created_at
    `);
    // member_count comes as string? so we convert it
    const parsedRows = rows.map(row => ({
      ...row,
      member_count: Number(row.member_count),
    }));
    return GroupWithMemberCountSchema.array().parse(parsedRows);
  } finally {
    client.release();
  }
}

export async function getGroupsWithMembersForUser(
  server: FastifyInstance,
  userId: number,
): Promise<GroupWithMembers[]> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT
        g.id,
        g.name,
        g.course_id,
        g.year,
        g.term,
        g.contact_details,
        g.meeting_day,
        g.meeting_time,
        g.meeting_location,
        g.created_at,
        json_agg(
          json_build_object(
            'id', u.id,
            'email', u.email,
            'name', u.name,
            'grad_year', u.grad_year,
            'role', u.role,
            'created_at', u.created_at,
            'group_role', ug2.group_role
          )
          ORDER BY u.id
        ) AS members
      FROM groups g
      JOIN user_groups ug1 ON ug1.group_id = g.id
      JOIN user_groups ug2 ON ug2.group_id = g.id
      JOIN users u ON u.id = ug2.user_id
      WHERE ug1.user_id = $1
      GROUP BY
        g.id,
        g.name,
        g.course_id,
        g.year,
        g.term,
        g.contact_details,
        g.meeting_day,
        g.meeting_time,
        g.meeting_location,
        g.created_at
      ORDER BY g.created_at DESC
    `, [userId]);

    // Parse members JSON string
    const parsedRows = rows.map(row => ({
      ...row,
      members: Array.isArray(row.members)
        ? row.members
        : JSON.parse(row.members),
    }));

    return GroupWithMembersSchema.array().parse(parsedRows);
  } finally {
    client.release();
  }
}

export async function getGroupById(
  server: FastifyInstance,
  id: number,
): Promise<Group | null> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, name, course_id, year, term, contact_details,
             meeting_day, meeting_time, meeting_location, created_at
      FROM groups
      WHERE id = $1
    `, [id]);
    if (rows.length === 0) return null;
    return GroupSchema.parse(rows[0]);
  } finally {
    client.release();
  }
}

export async function getGroupsByCourseId(
  server: FastifyInstance,
  courseId: number,
): Promise<Group[]> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, name, course_id, year, term, contact_details,
             meeting_day, meeting_time, meeting_location, created_at
      FROM groups
      WHERE course_id = $1
      ORDER BY year DESC, term DESC, id DESC`,
      [courseId]
    );
    return GroupSchema.array().parse(rows);
  } finally {
    client.release();
  }
}

export async function createGroupWithOwner(
  server: FastifyInstance,
  group: NewGroupInput,
  owner_id: number,
) {
  const client = await server.pg.connect();
  try {
    await client.query("BEGIN");

    // Insert group
    const { rows: groupRows } = await client.query(`
      INSERT INTO groups (
        name, course_id, year, term, contact_details,
        meeting_day, meeting_time, meeting_location
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, course_id, year, term, contact_details,
                meeting_day, meeting_time, meeting_location, created_at`,
      [
        group.name,
        group.course_id,
        group.year,
        group.term,
        group.contact_details,
        group.meeting_day ?? null,
        group.meeting_time
          ? group.meeting_time.toISOString().slice(11, 19) // "HH:MM:SS"
          : null,
        group.meeting_location ?? null,
      ]
    );
    const createdGroup = GroupSchema.parse(groupRows[0]);

    // Insert owner into user_groups
    const { rows: userGroupRows } = await client.query(`
      INSERT INTO user_groups (
        user_id, group_id, group_role
      )
      VALUES ($1, $2, 'owner'::user_group_role)
      RETURNING user_id, group_id, group_role, created_at`,
      [owner_id, createdGroup.id]
    );
    const ownerUserGroup = UserGroupSchema.parse(userGroupRows[0]);

    await client.query("COMMIT");
    return { group: createdGroup, owner: ownerUserGroup };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteGroup(
  server: FastifyInstance,
  id: number,
): Promise<boolean> {
  const client = await server.pg.connect();
  try {
    const { rowCount } = await client.query(
      `DELETE FROM groups WHERE id = $1`,
      [id]
    );
    return rowCount !== null && rowCount > 0;
  } finally {
    client.release();
  }
}

// Adds a user to a group, updating their role if already a member
export async function addUserToGroup(
  server: FastifyInstance,
  user_id: number,
  group_id: number,
  group_role: UserGroupRole = "member",
) {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      INSERT INTO user_groups (user_id, group_id, group_role)
      VALUES ($1, $2, $3::user_group_role)
      ON CONFLICT (user_id, group_id)
      DO UPDATE SET group_role = EXCLUDED.group_role
      RETURNING user_id, group_id, group_role, created_at`,
      [user_id, group_id, group_role]
    );
    return UserGroupSchema.parse(rows[0]); } finally {
    client.release();
  }
}

export async function removeUserFromGroup(
  server: FastifyInstance,
  user_id: number,
  group_id: number,
): Promise<boolean> {
  const client = await server.pg.connect();
  try {
    const { rowCount } = await client.query(`
      DELETE FROM user_groups
      WHERE user_id = $1 AND group_id = $2`,
      [user_id, group_id]
    );
    return rowCount !== null && rowCount > 0;
  } finally {
    client.release();
  }
}

export async function getUserGroupRole(
  server: FastifyInstance,
  user_id: number,
  group_id: number,
): Promise<UserGroup | null> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT user_id, group_id, group_role, created_at
      FROM user_groups
      WHERE user_id = $1 AND group_id = $2`,
      [user_id, group_id]
    );
    if (rows.length === 0) return null;
    return UserGroupSchema.parse(rows[0]);
  } finally {
    client.release();
  }
}

export async function getUsersInGroup(
  server: FastifyInstance,
  group_id: number,
): Promise<UserWithGroupRole[]> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT
        u.id, u.email, u.name, u.grad_year, u.role, u.created_at,
        ug.group_role
      FROM user_groups ug
      JOIN users u ON ug.user_id = u.id
      WHERE ug.group_id = $1
      ORDER BY ug.group_role DESC, u.name DESC`,
      [group_id]
    );
    return rows.map(row => UserWithGroupRoleSchema.parse({
      id: row.id,
      email: row.email,
      name: row.name,
      grad_year: row.grad_year,
      role: row.role,
      created_at: row.created_at,
      group_role: row.group_role,
    }));
  } finally {
    client.release();
  }
}
