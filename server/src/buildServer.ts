import fastify, { FastifyInstance } from "fastify"
import fastifyPostgres from "fastify-postgres"
import cookie from "fastify-cookie"
import fastifyCors from "@fastify/cors";

import config from "./config"
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";

export function buildServer(): FastifyInstance {
  const server = fastify();

  server.register(fastifyCors, {
    origin: ["http://localhost:5173"], // default Vite port
    credentials: true,
  });

  server.register(fastifyPostgres, {
    connectionString: `postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`,
  });

  server.register(cookie);

  server.register(authRoutes, { prefix: "/api/auth" });
  server.register(userRoutes, { prefix: "/api/user" });

  server.get("/api/ping", async (_request, _reply) => {
    return "pong";
  });

  return server;
}
