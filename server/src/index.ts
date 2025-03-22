import fastify from "fastify"
import fastifyPostgres from "fastify-postgres"
import cookie from "fastify-cookie"
import fastifyCors from "@fastify/cors";

import config from "./config"
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";

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

server.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing Fastify");
  try {
    await server.close();
    console.log("Fastify closed");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
});
