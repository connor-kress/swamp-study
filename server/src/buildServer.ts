import fastify, { FastifyInstance, FastifyRequest } from "fastify"
import fastifyPostgres from "fastify-postgres"
import cookie from "fastify-cookie"
import fastifyCors from "@fastify/cors";
import { Pool } from "pg";

import config from "./config"
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import emailPlugin from "./plugins/email"
import { getTestingSession } from "./testHelpers/sessions";

export function buildServer(pgPool?: Pool): FastifyInstance {
  const server = fastify();

  server.register(fastifyCors, {
    origin: ["http://localhost:5173"], // default Vite port
    credentials: true,
  });

  if (pgPool) {
    (server.pg as any) = pgPool;
  } else {
    if (!config.dbConfig) {
      throw new Error("Database config not found.");
    }
    console.log(
      `Connecting to Postgres: ${config.dbConfig.host}:${config.dbConfig.port}`
    );
    server.register(fastifyPostgres, config.dbConfig);
  }

  server.register(emailPlugin);

  server.register(cookie);

  server.addHook("preHandler", async (request: FastifyRequest, _reply) => {
    if (
      config.nodeEnv === "test" &&
      request.headers["x-test-auth"] === "1"
    ) {
      const role = request.headers["x-test-user-role"];
      const userIdHeader = request.headers["x-test-user-id"];
      if (!userIdHeader) throw new Error("Missing x-test-user-id");
      const testUserId = parseInt(userIdHeader as string, 10);
      if (isNaN(testUserId)) throw new Error("Invalid x-test-user-id");
      const isAdmin = role === "admin";
      const testSession = getTestingSession(testUserId, isAdmin);
      (request as any).testSession = testSession;
    }
  });


  server.register(authRoutes, { prefix: "/api/auth" });
  server.register(userRoutes, { prefix: "/api/user" });

  server.get("/api/ping", async (_request, _reply) => {
    return "pong";
  });

  return server;
}
