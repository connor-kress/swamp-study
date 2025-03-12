import fastify from "fastify"
import fastifyPostgres from "fastify-postgres"

import config from "./config"
import { getNow } from "./db/queries";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";

const server = fastify();

server.register(fastifyPostgres, {
  connectionString: `postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`,
});

server.register(authRoutes, { prefix: "/auth" });
server.register(userRoutes, { prefix: "/user" });

server.get("/now", async (_, reply) => {
  try {
    const nowRows = await getNow(server);
    return nowRows;
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
