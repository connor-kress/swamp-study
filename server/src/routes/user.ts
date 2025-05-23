import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import {
  createUser,
  deleteUser,
  getUserById,
  HashedUserInput,
} from "../db/queries";
import { NewUserInputSchema } from "../types";
import { hashPassword } from "../util/crypt";
import { verifyAccessToken, verifyAdminAccessToken } from "./auth";

export const idParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

const userRoutes: FastifyPluginAsync = async (server) => {
  // GET /user/:id - Fetch a user by ID.
  server.get("/:id", async (request, reply) => {
    const parsed = idParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      reply.code(400);
      return { error: parsed.error.flatten() };
    }
    const { id } = parsed.data;
    if (isNaN(id)) {
      reply.code(400).send({ error: "Invalid user id." });
      console.log("Invalid user id (non-numeric).");
      return;
    }

    const session = await verifyAccessToken(request, reply);
    const user = session?.user
    if (!user || (user.id !== id && user.role !== "admin")) {
      if (user) reply.code(401).send({
        error: "Invalid credentials for account.",
      });
      console.log("Verification failed for GET /user/:id");
      return;
    }

    try {
      const user = await getUserById(server, id);
      if (!user) {
        reply.code(404);
        return { error: "User not found." };
      }
      return user;
    } catch (error) {
      reply.code(500);
      console.log(error);
      return { error: "Database error occurred." };
    }
  });

  // POST /user/ - Create a new user (admin only).
  server.post("/", async (request, reply) => {
    const session = await verifyAdminAccessToken(request, reply);
    if (!session) {
      console.log("Unauthorized POST /user/");
      return;
    }
    const parsed = NewUserInputSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400);
      return { error: parsed.error.flatten() };
    }
    const { email, password, name, grad_year, role } = parsed.data;
    const userInput: HashedUserInput = {
      email, name, grad_year, role,
      password_hash: await hashPassword(password),
    };

    try {
      const newUser = await createUser(server, userInput);
      reply.code(201);
      return newUser;
    } catch (error: any) {
      if (error?.code === "23505") {
        console.error("Error creating user: Email already in use");
        reply.code(409);  // conflict
        return { error: "Email already in use." };
      }
      console.error("Error creating user:", error);
      reply.code(500);
      return { error: "Database error occurred." };
    }
  });

  // DELETE /user/:id - Delete a user by ID.
  server.delete("/:id", async (request, reply) => {
    const parsed = idParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      reply.code(400);
      return { error: parsed.error.flatten() };
    }
    const { id } = parsed.data;
    if (isNaN(id)) {
      reply.code(400).send({ error: "Invalid user id." });
      console.log("Invalid user id (non-numeric).");
      return;
    }

    const session = await verifyAccessToken(request, reply);
    const user = session?.user
    if (!user || (user.id !== id && user.role !== "admin")) {
      if (user) reply.code(401).send({
        error: "Invalid credentials for account.",
      });
      console.log("Verification failed for DELETE /user/:id");
      return;
    }

    try {
      const success = await deleteUser(server, id);
      if (!success) {
        reply.code(404);
        return { error: "User not found." };
      }
      reply.code(200);
      console.log(`Successfully deleted account: ${user.email}`);
      return { status: "success", message: `Account ${user.email} deleted.` };
    } catch (error) {
      console.error(`Error deleting account: ${user.email} -`, error);
      reply.code(500);
      return { error: "Database error occurred." };
    }
  });

};

export default userRoutes;
