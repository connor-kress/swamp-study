import { buildServer } from "./buildServer";

const server = buildServer();

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
