import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify"
import { z } from "zod";

import {
  createUserSession,
  getPasswordHashByEmail,
  getSessionByAccessToken,
  getSessionByRefreshToken,
  getUserByEmail,
  updateSessionTokens,
} from "../db/queries";
import { verifyPassword } from "../util/crypt";
import crypto from "crypto"
import { SessionWithUser } from "../types";

function generateToken(size = 32): string {
  return crypto.randomBytes(size).toString("hex");
}

export async function verifyAccessToken(
  server: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<SessionWithUser | null> {
  const accessToken = request.cookies?.accessToken;
  if (!accessToken) {
    reply.code(401).send({ error: "Access token missing." });
    return null;
  }
  const session = await getSessionByAccessToken(server, accessToken);
  if (!session) {
    reply.code(401).send({ error: "Invalid or expired access token." });
    return null;
  }
  return session;
}

const authRoutes: FastifyPluginAsync = async (server) => {

  // POST /auth/refresh - Attempts rolling token refresh with refresh token
  server.post("/refresh", async (request, reply) => {
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) {
      reply.code(401).send({ error: "Refresh token missing." });
      return;
    }

    let session = await getSessionByRefreshToken(server, refreshToken);
    if (!session) {
      reply.code(401).send({ error: "Invalid session." });
      return null;
    }

    // Generate new tokens for rolling sessions
    const newAccessToken = generateToken();
    const newRefreshToken = generateToken();
    const newAccessExpires = new Date(Date.now() + 15*60*1000); // 15 minutes
    const newRefreshExpires = new Date(Date.now() + 7*24*60*60*1000); // 7 days

    // Update user session in db
    const newSession = await updateSessionTokens(server, session.session.id, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        accessExpires: newAccessExpires,
        refreshExpires: newRefreshExpires,
    });
    if (!newSession) {
      reply.code(500).send({ error: "Unable to update user session." });
      return null;
    }
    session.session = newSession;

    // Set new cookies
    reply.setCookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: newAccessExpires,
    });
    reply.setCookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: newRefreshExpires,
    });

    return { status: "success", data: session };
  });

  // GET /auth/verify - Verifies access token
  server.get("/verify", async (request, reply) => {
    const session = await verifyAccessToken(server, request, reply);
    if (!session) {
      console.log(`Verification failed`);
      return;
    }
    console.log(`Verification successful: ${session.user.email}`);
    return { session };
  });

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
