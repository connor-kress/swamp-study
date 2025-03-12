import { FastifyPluginAsync } from "fastify"
import { z } from "zod";

import { getPasswordHashByEmail } from "../db/queries";
import { verifyPassword } from "../util/crypt";

const authRoutes: FastifyPluginAsync = async (server) => {

  const loginParamsSchema = z.object({ email: z.string(), password: z.string() });


  // GET /auth/login - Attempt password login (TODO: token auth)
  server.get("/login", async (request, reply) => {
    const parsed = loginParamsSchema.safeParse(request.query);
    if (!parsed.success) {
      reply.status(400);
      return { error: parsed.error.flatten() };
    }
    const { email, password } = parsed.data;

    try {
      const passwordHash = await getPasswordHashByEmail(server, email);
      if (!passwordHash) {
        reply.code(404);
        return { error: "User not found" };
      }
      if (await verifyPassword(password, passwordHash)) {
        console.log(`Login successful: ${email}`);
        return {"status": "success"};
      } else {
        console.log(`Login failed: ${email}`);
        return {"status": "failure"};
      }
    } catch (error) {
      reply.code(500);
      console.log(error);
      return { error: "Database error occurred" };
    }
  });

}

export default authRoutes;
