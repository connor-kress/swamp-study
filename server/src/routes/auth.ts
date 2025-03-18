import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify"
import { z } from "zod";

import {
  createUserSession,
  deleteUserSession,
  getPasswordHashByEmail,
  getSessionByAccessToken,
  getSessionByRefreshToken,
  getUserByEmail,
  updateSessionTokens,
} from "../db/queries";
import { generateToken, verifyPassword } from "../util/crypt";
import { SessionWithUser, TokenData } from "../types";

function setTokenCookies(reply: FastifyReply, data: TokenData) {
    reply.setCookie("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: data.accessExpires,
    });
    reply.setCookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: data.refreshExpires,
    });
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
    const tokenData: TokenData = {
      accessToken: generateToken(),
      refreshToken: generateToken(),
      accessExpires: new Date(Date.now() + 15*60*1000), // 15 minutes
      refreshExpires: new Date(Date.now() + 7*24*60*60*1000), // 7 days
    }

    // Update user session in db
    const newSession = await updateSessionTokens(
      server, session.session.id, tokenData
    );
    if (!newSession) {
      reply.code(500).send({ error: "Unable to update user session." });
      return null;
    }
    session.session = newSession;
    setTokenCookies(reply, tokenData);
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

  // POST /auth/login - Attempt password login
  server.post("/login", async (request, reply) => {
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

      const user = await getUserByEmail(server, email);
      if (!user) throw new Error("User should always exist here");

      const tokenData: TokenData = {
        accessToken: generateToken(),
        refreshToken: generateToken(),
        accessExpires: new Date(Date.now() + 15*60*1000), // 15 minutes
        refreshExpires: new Date(Date.now() + 7*24*60*60*1000), // 7 days
      }
      await createUserSession(server, user.id, tokenData);
      setTokenCookies(reply, tokenData);

      console.log(`Login successful: ${email}`);
      return { message: "Login successful" };
    } catch (error) {
      reply.code(500);
      console.log(error);
      return { error: "Database error occurred" };
    }
  });

  // POST /auth/logout - Logout the current session
  server.post("/logout", async (request, reply) => {
    const accessToken = request.cookies?.accessToken;
    if (!accessToken) {
      reply.code(401).send({ error: "No active session found." });
      return;
    }

    const session = await getSessionByAccessToken(server, accessToken);
    if (!session) {
      reply.code(401).send({ error: "Invalid session." });
      return;
    }

    const success = await deleteUserSession(server, session.session.id);
    if (!success) {
      reply.code(500).send({ error: "Failed to delete session." });
      return;
    }

    reply.clearCookie("accessToken");
    reply.clearCookie("refreshToken");

    console.log(`Logout successful: ${session.user.email}`);
    return { status: "success", message: "Logged out successfully." };
  });

}

export default authRoutes;
