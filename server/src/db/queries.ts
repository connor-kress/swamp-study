import { FastifyInstance } from "fastify";

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
  id: number
): Promise<any> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return rows[0];
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}
