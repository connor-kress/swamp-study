import fastify, { FastifyInstance } from "fastify"
import fastifyPostgres from "fastify-postgres"
import cookie from "fastify-cookie"
import fastifyCors from "@fastify/cors";

import config from "./config"
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import { getTestingSession } from "./testHelpers/sessions";
import { Pool } from "pg";

export function buildServer(pgPool?: Pool): FastifyInstance {
  const server = fastify();

  server.register(fastifyCors, {
    origin: ["http://localhost:5173"], // default Vite port
    credentials: true,
  });

  if (pgPool) {
    (server.pg as any) = pgPool;
  } else {
    console.log(`Connecting to postgres: ${config.host}:${config.port}`);
    server.register(fastifyPostgres, {
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      database: config.database,
    });
  }

  server.register(cookie);

  server.addHook("preHandler", async (request, _reply) => {
    if (
      process.env.NODE_ENV !== "production" &&
      request.headers["x-test-auth"] === "1"
    ) {
      const role = request.headers["x-test-user-role"];
      const userIdHeader = request.headers["x-test-user-id"];
      if (!userIdHeader) throw new Error("Missing x-test-user-id");
      const testUserId = parseInt(userIdHeader as string, 10);
      if (isNaN(testUserId)) throw new Error("Invalid x-test-user-id");
      (request as any).testSession = getTestingSession(testUserId,
                                                       role === "admin");
    }
  });


  server.register(authRoutes, { prefix: "/api/auth" });
  server.register(userRoutes, { prefix: "/api/user" });

  server.get("/api/ping", async (_request, _reply) => {
    return "pong";
  });

  return server;
}
