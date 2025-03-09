import fastify from "fastify"
import fastifyPostgres from "fastify-postgres"

import config from "./config"

const server = fastify();

server.register(fastifyPostgres, {
  connectionString: `postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`,
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
