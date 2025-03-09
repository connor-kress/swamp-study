import fastify from "fastify"
import fastifyPostgres from "fastify-postgres"

const server = fastify();

const user = "...";
const password = "...";
const database = "swampstudy";
const host = "localhost";
const port = "5432";

server.register(fastifyPostgres, {
  connectionString: `postgres://${user}:${password}@${host}:${port}/${database}`,
});

server.get("/now", async (_, reply) => {
  const client = await server.pg.connect();

  try {
    const { rows } = await client.query("SELECT NOW()");
    return rows;
  } catch (error) {
    reply.code(500);
    return { error: "Database error occurred" };
  } finally {
    client.release();
  }
});

server.get("/ping", async (request, reply) => {
  return "pong";
});

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
