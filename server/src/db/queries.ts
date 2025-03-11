import { FastifyInstance } from "fastify";
import { z } from "zod";
import { UserSchema, User } from "../types";

export async function getNow(
  server: FastifyInstance
): Promise<{ now: string }> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query("SELECT NOW() as now");
    return rows[0];
  } catch (error) {
    throw error;
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
      WHERE id = $1
    `, [id]);
    if (rows.length === 0) return null;
    return UserSchema.parse(rows[0]);
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
      "SELECT password_hash FROM users WHERE email = $1", [email]
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
