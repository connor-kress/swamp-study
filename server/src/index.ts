import fastify from "fastify"
import fastifyPostgres from "fastify-postgres"

import config from "./config"
import { createUser, deleteUser, getNow, getPasswordHashByEmail, getUserById, NewUserInput } from "./db/queries";
import { CreateUserInput, CreateUserInputSchema } from "./types";
import { z } from "zod";

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

server.post("/users", async (request, reply) => {
  const parsed = CreateUserInputSchema.safeParse(request.body);
  if (!parsed.success) {
    reply.status(400);
    return { error: parsed.error.flatten() };
  }
  const { email, password, name, grad_year, role } = parsed.data;
  const userInput: NewUserInput = {
    email, name, grad_year,
    role: role ? role : "member",
    password_hash: password, // TODO: hashing
  };

  try {
    const newUser = await createUser(server, userInput);
    reply.status(201);
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    reply.status(500);
    return { error: "Database error occurred" };
  }
});

const deleteUserParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

server.delete("/user/:id", async (request, reply) => {
  // Validate and parse the route parameters
  const parseResult = deleteUserParamsSchema.safeParse(request.params);
  if (!parseResult.success) {
    reply.status(400);
    return { error: parseResult.error.flatten() };
  }

  const { id } = parseResult.data;

  try {
    const success = await deleteUser(server, id);
    if (!success) {
      reply.status(404);
      return { error: "User not found" };
    }
    reply.status(200);
    return { status: "success", message: `User ${id} deleted` };
  } catch (error) {
    console.error("Error deleting user:", error);
    reply.status(500);
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
