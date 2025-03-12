import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { createUser, deleteUser, getUserById, NewUserInput } from "../db/queries";
import { CreateUserInputSchema } from "../types";
import { hashPassword } from "../util/crypt";

const idParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

const userRoutes: FastifyPluginAsync = async (server) => {

  // GET /user/:id - fetch a user by ID.
  server.get("/:id", async (request, reply) => {
    const parsed = idParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      reply.status(400);
      return { error: parsed.error.flatten() };
    }
    const { id } = parsed.data;

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

  // POST /user - create a new user.
  server.post("/", async (request, reply) => {
    const parsed = CreateUserInputSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400);
      return { error: parsed.error.flatten() };
    }
    const { email, password, name, grad_year, role } = parsed.data;
    const userInput: NewUserInput = {
      email, name, grad_year,
      role: role ? role : "member",
      password_hash: await hashPassword(password),
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

  // DELETE /user/:id - delete a user by ID.
  server.delete("/:id", async (request, reply) => {
    const parsed = idParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      reply.status(400);
      return { error: parsed.error.flatten() };
    }
    const { id } = parsed.data;

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

};

export default userRoutes;
