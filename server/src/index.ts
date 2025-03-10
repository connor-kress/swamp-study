import fastify from "fastify"
import fastifyPostgres from "fastify-postgres"

import config from "./config"
import { getNow, getUserById } from "./db/queries";

const server = fastify();

server.register(fastifyPostgres, {
  connectionString: `postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`,
});

server.get("/now", async (_, reply) => {
  try {
    const nowRows = await getNow(server);
    return nowRows;
  } catch (error) {
    reply.code(500);
    return { error: "Database error occurred" };
  }
});

server.get("/user/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  try {
    const user = await getUserById(server, Number(id));
    if (!user) {
      reply.code(404);
      return { error: "User not found" };
    }
    return user;
  } catch (error) {
    reply.code(500);
    return { error: "Database error occurred" };
  }
});

server.get("/ping", async (_request, _reply) => {
  return "pong";
});

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
