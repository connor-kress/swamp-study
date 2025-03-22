import {
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify"
import { z } from "zod";

import {
  createUserSession,
  deleteAllUserSessions,
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
      sameSite: "lax",
      path: "/",
      expires: data.accessExpires,
    });
    reply.setCookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth/refresh",  // only send cookie for refresh
      expires: data.refreshExpires,
    });
}

function generateNewTokenData(): TokenData {
  return {
    accessToken: generateToken(),
    refreshToken: generateToken(),
    accessExpires: new Date(Date.now() + 15*60*1000), // 15 minutes
    refreshExpires: new Date(Date.now() + 7*24*60*60*1000), // 7 days
  };
}

export async function verifyAccessToken(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<SessionWithUser | null> {
  const accessToken = request.cookies?.accessToken;
  if (!accessToken) {
    console.log("No access token provided");
    reply.code(401).send({ error: "Access token missing." });
    return null;
  }
  const session = await getSessionByAccessToken(request.server, accessToken);
  if (!session) {
    console.log("Invalid or expired access token.");
    reply.code(401).send({ error: "Invalid or expired access token." });
    return null;
  }
  return session;
}

const authRoutes: FastifyPluginAsync = async (server) => {

  // POST /auth/refresh - Attempts rolling token refresh with refresh token.
  server.post("/refresh", async (request, reply) => {
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) {
      console.log(`Refresh failed: Refresh token missing`);
      reply.code(401).send({ error: "Refresh token missing." });
      return;
    }

    let session = await getSessionByRefreshToken(server, refreshToken);
    if (!session) {
      console.log(`Refresh failed: Invalid session`);
      reply.code(401).send({ error: "Invalid session." });
      return null;
    }

    const tokenData = generateNewTokenData();
    const newSession = await updateSessionTokens(
      server, session.session.id, tokenData
    );
    if (!newSession) {
      console.log(`Refresh failed: Unable to update user session`);
      reply.code(500).send({ error: "Unable to update user session." });
      return null;
    }
    session.session = newSession;
    setTokenCookies(reply, tokenData);
    console.log("Refresh successful");
    return { status: "success", data: session };
  });

  // GET /auth/verify - Verifies access token.
  server.get("/verify", async (request, reply) => {
    const session = await verifyAccessToken(request, reply);
    if (!session) {
      console.log(`Verification failed`);
      return;
    }
    console.log(`Verification successful: ${session.user.email}`);
    return { user: session.user };
  });

  const loginParamsSchema = z.object({
    email: z.string(),
    password: z.string(),
  });

  // POST /auth/login - Attempt password login.
  server.post("/login", async (request, reply) => {
    const parsed = loginParamsSchema.safeParse(request.body);
    if (!parsed.success) {
      console.log(parsed.error.flatten());
      reply.status(400);
      return { error: parsed.error.flatten() };
    }
    const { email, password } = parsed.data;

    try {
      const passwordHash = await getPasswordHashByEmail(server, email);
      if (!passwordHash) {
        reply.code(404);
        return { error: "User not found." };
      }
      if (!await verifyPassword(password, passwordHash)) {
        console.log(`Login failed: ${email}`);
        return { error: "Invalid password." };
      }

      const user = await getUserByEmail(server, email);
      if (!user) throw new Error("User should always exist here");

      const tokenData = generateNewTokenData();
      await createUserSession(server, user.id, tokenData);
      setTokenCookies(reply, tokenData);

      console.log(`Login successful: ${email}`);
      return { message: "Login successful" };
    } catch (error) {
      reply.code(500);
      console.log(error);
      return { error: "Database error occurred." };
    }
  });

  // POST /auth/logout - Logout the current session.
  server.post("/logout", async (request, reply) => {
    const session = await verifyAccessToken(request, reply);
    if (!session) {
      console.log("Logout failed");
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

  // POST /auth/logout-all - Logout all sessions for a user.
  server.post("/logout-all", async (request, reply) => {
    const session = await verifyAccessToken(request, reply);
    if (!session) {
      console.log("Logout-all failed");
      return;
    }

    const rowCount = await deleteAllUserSessions(server, session.user.id);
    if (rowCount === 0) {
      reply.code(500).send({ error: "Failed to delete sessions." });
      return;
    }

    reply.clearCookie("accessToken");
    reply.clearCookie("refreshToken");

    console.log(`Logout-all successful: ${session.user.email} (${rowCount})`);
    return { status: "success", message: "All sessions have been logged out." };
  });

}

export default authRoutes;
