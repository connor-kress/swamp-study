import { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  UserSchema,
  User,
  UserSession,
  UserSessionSchema,
  SessionWithUser,
  TokenData,
  NewPendingVerificationInput,
  PendingVerification,
  PendingVerificationSchema,
} from "../types";

export async function getAllUsers(
  server: FastifyInstance,
): Promise<User[]> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, email, name, grad_year, role, created_at
      FROM users
    `);
    return UserSchema.array().parse(rows);
  } finally {
    client.release();
  }
}

export async function getUserById(
  server: FastifyInstance,
  id: number,
): Promise<User | null> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, email, name, grad_year, role, created_at
      FROM users
      WHERE id = $1`, [id],
    );
    if (rows.length === 0) return null;
    return UserSchema.parse(rows[0]);
  } finally {
    client.release();
  }
}

export async function getUserByEmail(
  server: FastifyInstance,
  email: string,
): Promise<User | null> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, email, name, grad_year, role, created_at
      FROM users
      WHERE email = $1`, [email],
    );
    if (rows.length === 0) return null;
    return UserSchema.parse(rows[0]);
  } finally {
    client.release();
  }
}

export type HashedUserInput = Omit<
  User, "id" | "created_at"
> & { password_hash: string };

export async function createUser(
  server: FastifyInstance,
  user: HashedUserInput,
): Promise<User> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      INSERT INTO users (email, password_hash, name, grad_year, role)
      VALUES ($1, $2, $3, $4, $5::user_role)
      RETURNING id, email, name, grad_year, role, created_at;`,
      [user.email, user.password_hash, user.name, user.grad_year, user.role],
    );
    return UserSchema.parse(rows[0]);
  } finally {
    client.release();
  }
}

export async function deleteUser(
  server: FastifyInstance,
  id: number
): Promise<boolean> {
  const client = await server.pg.connect();
  try {
    const { rowCount } = await client.query(
      `DELETE FROM users WHERE id = $1`, [id]
    );
    return rowCount !== null && rowCount > 0;
  } finally {
    client.release();
  }
}

export async function createUserSession(
  server: FastifyInstance,
  userId: number,
  data: TokenData,
): Promise<UserSession> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      INSERT INTO user_sessions
      (user_id, access_token, refresh_token, access_expires, refresh_expires)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        userId,
        data.accessToken,
        data.refreshToken,
        data.accessExpires,
        data.refreshExpires,
      ],
    );
    return UserSessionSchema.parse(rows[0]);
  } finally {
    client.release();
  }
}

export async function getPasswordHashByEmail(
  server: FastifyInstance,
  email: string,
): Promise<string | null> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(
      `SELECT password_hash FROM users WHERE email = $1`, [email]
    );
    if (rows.length === 0) return null;
    // Validate that password hash is a string
    return z.string().parse(rows[0].password_hash);
  } finally {
    client.release();
  }
}

export async function deleteUserSession(
  server: FastifyInstance,
  id: number,
): Promise<boolean> {
  const client = await server.pg.connect();
  try {
    const { rowCount } = await client.query(
      `DELETE FROM user_sessions WHERE id = $1`, [id]
    );
    return rowCount !== null && rowCount > 0;
  } finally {
    client.release();
  }
}

export async function deleteAllUserSessions(
  server: FastifyInstance,
  userId: number,
): Promise<number> {
  const client = await server.pg.connect();
  try {
    const { rowCount } = await client.query(
      `DELETE FROM user_sessions WHERE user_id = $1`, [userId]
    );
    return rowCount ?? 0;
  } finally {
    client.release();
  }
}

export async function getSessionByAccessToken(
  server: FastifyInstance,
  accessToken: string,
): Promise<SessionWithUser | null> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT
        row_to_json(u) AS "user",
        row_to_json(s) AS "session"
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.access_token = $1
        AND s.access_expires::timestamp > CURRENT_TIMESTAMP::timestamp
      LIMIT 1`,
      [accessToken],
    );
    if (rows.length === 0) return null;
    return {
      user: UserSchema.parse(rows[0].user),
      session: UserSessionSchema.parse(rows[0].session),
    };
  } finally {
    client.release();
  }
}

export async function getSessionByRefreshToken(
  server: FastifyInstance,
  refreshToken: string,
): Promise<SessionWithUser | null> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT
        row_to_json(u) AS "user",
        row_to_json(s) AS "session"
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.refresh_token = $1
        AND s.refresh_expires::timestamp > CURRENT_TIMESTAMP::timestamp
      LIMIT 1`,
      [refreshToken],
    );
    if (rows.length === 0) return null;
    return {
      user: UserSchema.parse(rows[0].user),
      session: UserSessionSchema.parse(rows[0].session),
    };
  } finally {
    client.release();
  }
}

export async function updateSessionTokens(
  server: FastifyInstance,
  sessionId: number,
  data: TokenData,
): Promise<UserSession | null> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      UPDATE user_sessions
      SET access_token = $1,
          refresh_token = $2,
          access_expires = $3,
          refresh_expires = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *`,
      [
        data.accessToken,
        data.refreshToken,
        data.accessExpires,
        data.refreshExpires,
        sessionId,
      ]
    );
    if (rows.length === 0) return null;
    return UserSessionSchema.parse(rows[0]);
  } finally {
    client.release();
  }
}

export async function upsertPendingVerification(
  server: FastifyInstance,
  verification: NewPendingVerificationInput,
): Promise<PendingVerification> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      INSERT INTO pending_verifications (email, code_hash, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET
        code_hash = EXCLUDED.code_hash,
        expires_at = EXCLUDED.expires_at
      RETURNING email, code_hash, expires_at, created_at;`,
      [verification.email, verification.code_hash, verification.expires_at],
    );
    return PendingVerificationSchema.parse(rows[0]);
  } finally {
    client.release();
  }
}

export async function getPendingVerificationByEmail(
  server: FastifyInstance,
  email: string,
): Promise<PendingVerification | null> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT email, code_hash, expires_at, created_at
      FROM pending_verifications
      WHERE email = $1;`,
      [email],
    );

    if (rows.length === 0) return null;
    return PendingVerificationSchema.parse(rows[0]);
  } finally {
    client.release();
  }
}

export async function deletePendingVerificationByEmail(
  server: FastifyInstance,
  email: string,
): Promise<boolean> {
  const client = await server.pg.connect();
  try {
    const { rowCount } = await client.query(
      `DELETE FROM pending_verifications WHERE email = $1`, [email]
    );
    return rowCount !== null && rowCount > 0;
  } finally {
    client.release();
  }
}

export async function deleteExpiredPendingVerifications(
  server: FastifyInstance,
): Promise<number> {
  const client = await server.pg.connect();
  try {
    const { rowCount } = await client.query(`
      DELETE FROM pending_verifications
      WHERE expires_at < NOW();
    `);
    return rowCount ?? 0;
  } finally {
    client.release();
  }
}
