import { FastifyInstance } from "fastify";
import {
  GroupSchema,
  Group,
  UserGroupSchema,
  UserGroupRole,
  UserGroup,
} from "../types";

export async function getAllGroups(
  server: FastifyInstance,
): Promise<Group[]> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, course_id, year, term, contact_details,
             meeting_day, meeting_time, created_at
      FROM groups
      ORDER BY year DESC, term DESC, course_id DESC, id DESC
    `);
    return GroupSchema.array().parse(rows);
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
      SELECT id, course_id, year, term, contact_details,
             meeting_day, meeting_time, created_at
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
      SELECT id, course_id, year, term, contact_details,
             meeting_day, meeting_time, created_at
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

export type NewGroupInput = Omit<Group, "id" | "created_at">;

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
        course_id, year, term, contact_details,
        meeting_day, meeting_time
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, course_id, year, term, contact_details,
                meeting_day, meeting_time, created_at`,
      [
        group.course_id,
        group.year,
        group.term,
        group.contact_details,
        group.meeting_day ?? null,
        group.meeting_time
          ? group.meeting_time.toISOString().slice(11, 19) // "HH:MM:SS"
          : null,
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
    return UserGroupSchema.parse(rows[0]);
  } finally {
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
