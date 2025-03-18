import { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  UserSchema,
  User,
  UserSession,
  UserSessionSchema,
  SessionWithUser,
  TokenData,
} from "../types";

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
  } catch (error) {
    throw error;
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
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

export type NewUserInput = Omit<
  User, "id" | "created_at"
> & { password_hash: string };

export async function createUser(
  server: FastifyInstance,
  user: NewUserInput,
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
  } catch (error) {
    throw error;
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
    return rowCount > 0;
  } catch (error) {
    throw error;
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
  } catch (error) {
    throw error;
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
  } catch (error) {
    throw error;
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
    return rowCount > 0;
  } catch (error) {
    throw error;
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
    return rowCount;
  } catch (error) {
    throw error;
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
        row_to_json(u) AS user,
        row_to_json(s) AS session
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.access_token = $1
        AND s.access_expires > CURRENT_TIMESTAMP
      LIMIT 1`,
      [accessToken],
    );
    if (rows.length === 0) return null;
    return {
      user: UserSchema.parse(rows[0].user),
      session: UserSessionSchema.parse(rows[0].session),
    };
  } catch (error) {
    throw error;
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
        row_to_json(u) AS user,
        row_to_json(s) AS session
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.refresh_token = $1
        AND s.refresh_expires > CURRENT_TIMESTAMP
      LIMIT 1`,
      [refreshToken],
    );
    if (rows.length === 0) return null;
    return {
      user: UserSchema.parse(rows[0].user),
      session: UserSessionSchema.parse(rows[0].session),
    };
  } catch (error) {
    throw error;
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
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}
