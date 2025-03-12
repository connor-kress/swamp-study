import { FastifyPluginAsync } from "fastify"
import { z } from "zod";

import {
  createUserSession,
  getPasswordHashByEmail,
  getUserByEmail,
} from "../db/queries";
import { verifyPassword } from "../util/crypt";
import crypto from "crypto"


function generateToken(size = 32): string {
  return crypto.randomBytes(size).toString("hex");
}

const authRoutes: FastifyPluginAsync = async (server) => {

  const loginParamsSchema = z.object({
    email: z.string(),
    password: z.string(),
  });

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
      if (!await verifyPassword(password, passwordHash)) {
        console.log(`Login failed: ${email}`);
        return { error: "Invalid password" };
      }

      const accessToken = generateToken();
      const refreshToken = generateToken();
      const accessExpires = new Date(Date.now() + 15*60*1000); // 15 mins
      const refreshExpires = new Date(Date.now() + 7*24*60*60*1000); // 7 days
      const user = await getUserByEmail(server, email);
      if (!user) throw new Error("User should always exist here");

      await createUserSession(server, {
        user_id: user.id,
        access_token: accessToken,
        refresh_token: refreshToken,
        access_expires: accessExpires,
        refresh_expires: refreshExpires,
      });

      reply.setCookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires: accessExpires,
      });
      reply.setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        expires: refreshExpires,
      });
      console.log(`Login successful: ${email}`);
      return { msg: "Login successful" };
    } catch (error) {
      reply.code(500);
      console.log(error);
      return { error: "Database error occurred" };
    }
  });

}

export default authRoutes;
