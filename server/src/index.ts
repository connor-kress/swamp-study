import fastify from "fastify"
import fastifyPostgres from "fastify-postgres"

import config from "./config"
import { getNow, getPasswordHashByEmail, getUserById } from "./db/queries";

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
    console.log(error);
    return { error: "Database error occurred" };
  }
});

type LoginParams = { email: string, password: string };

server.get("/auth/login", async (request, reply) => {
  const { email, password } = request.query as LoginParams;
  console.log(email);
  try {
    const passwordHash = await getPasswordHashByEmail(server, email);
    if (!passwordHash) {
      reply.code(404);
      return { error: "User not found" };
    }
    // Not actually a hash for testing
    if (password === passwordHash) {
      return {"status": "success"};
    } else {
      return {"status": "failure"};
    }
  } catch (error) {
    reply.code(500);
    console.log(error);
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
