import { FastifyInstance } from "fastify";
import { z } from "zod";
import { UserSchema, User, UserSession, UserSessionSchema } from "../types";

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

export type NewUserSessionInput = Omit<
  UserSession, "id" | "created_at" | "updated_at"
>;

export async function createUserSession(
  server: FastifyInstance,
  data: NewUserSessionInput
): Promise<UserSession> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      INSERT INTO user_sessions
      (user_id, access_token_hash, refresh_token_hash,
       access_expires, refresh_expires)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        data.user_id,
        data.access_token_hash,
        data.refresh_token_hash,
        data.access_expires,
        data.refresh_expires,
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
  id: number
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

export async function getUserFromSession(
  server: FastifyInstance,
  accessTokenHash: string
): Promise<User | null> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT
        u.id, u.email, u.name, u.grad_year, u.role,
        u.created_at, s.access_expires
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.access_token_hash = $1
        AND s.access_expires > CURRENT_TIMESTAMP`,
      [accessTokenHash],
    );
    if (rows.length === 0) return null;
    // If desired, you could also verify the access_expires field from rows[0].
    return UserSchema.parse(rows[0]);
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}
