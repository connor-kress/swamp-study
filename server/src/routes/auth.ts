import {
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify"
import { z } from "zod";

import {
  createUser,
  createUserSession,
  deleteAllUserSessions,
  deletePendingVerificationByEmail,
  deleteUserSession,
  getPasswordHashByEmail,
  getPendingVerificationByEmail,
  getSessionByAccessToken,
  getSessionByRefreshToken,
  getUserByEmail,
  NewUserInput,
  updateSessionTokens,
  upsertPendingVerification,
} from "../db/queries";
import { generatePasscode, generateToken, hashPassword, verifyPassword } from "../util/crypt";
import { NewPendingVerificationInput, SessionWithUser, TokenData } from "../types";
import { rateLimitTimeRemaining } from "../util/rateLimit";

function setTokenCookies(reply: FastifyReply, data: TokenData) {
    reply.setCookie("accessToken", data.accessToken, { httpOnly: true,
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

export function generateNewTokenData(): TokenData {
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
  allowOverride: boolean = true,
): Promise<SessionWithUser | null> {
  const testSession: SessionWithUser | null = (request as any).testSession;
  if (testSession && allowOverride) {
    return testSession;
  }
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

export async function verifyAdminAccessToken(
  request: FastifyRequest,
  reply: FastifyReply,
  allowOverride: boolean = true,
): Promise<SessionWithUser | null> {
  const session = await verifyAccessToken(request, reply, allowOverride);
  if (!session) return null;
  if (session.user.role !== "admin") {
    reply.code(401).send({
      error: "Access denied: admin only.",
    });
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
    const session = await verifyAccessToken(request, reply, false);
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

  const emailVerificationRequestSchema = z.object({
    email: z.string().email(),
    name: z.string(),
  })

  // TODO: put in a config
  const VerificationRequestRateLimit = {
    timeout: 15 * 60 * 1000, // 15 minutes
    maxCount: 3 // max requests per IP per timeout
  };

  const ipVerificationRequestCounts =
    new Map<string, { count: number; resetTime: number }>();

  // POST /auth/request-signup-code - Sends an email verification code.
  server.post("/request-signup-code", async (request, reply) => {
    const parsed = emailVerificationRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      console.log(parsed.error.flatten());
      reply.status(400);
      return { error: parsed.error.flatten() };
    }
    const { email, name } = parsed.data;

    // Check if email already in database
    const user = await getUserByEmail(server, email);
    if (user) {
      reply.status(409);
      return { error: "Email already in use." };
    }

    const timeRemaining = rateLimitTimeRemaining(
      ipVerificationRequestCounts,
      VerificationRequestRateLimit,
      request.ip,
    );
    if (timeRemaining !== null) {
      console.log(`Rate limited ${request.ip} (verification email request)`);
      reply.status(429);
      return {
        error: "Too many requests. Please try again later.",
        timeRemaining,
      };
    }

    // Generate and store passcode
    const code = generatePasscode();
    const pendingVerification: NewPendingVerificationInput = {
      email: email,
      code_hash: await hashPassword(code),
      expires_at: new Date(Date.now() + 10*60*1000), // 10 mins
    };
    await upsertPendingVerification(server, pendingVerification);

    try {
      await server.emailService.sendVerificationCode(email, name, code);
      return { message: "Verification code sent to your email." };
      // return { message: code}; // for testing
    } catch (err) {
      console.error("Failed to send verification code:", err);
      reply.status(500);
      return { message: "Failed to send verification code." };
    }
  });

  const RegisterInputSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string(),
    grad_year: z.number(),
    code: z.string(),
  });

  // POST /auth/register - Registers a verified account.
  server.post("/register", async (request, reply) => {
    const parsed = RegisterInputSchema.safeParse(request.body);
    if (!parsed.success) {
      console.log(parsed.error.flatten());
      reply.status(400);
      return { error: parsed.error.flatten() };
    }
    const { email, password, name, grad_year, code } = parsed.data;

    const pendingVerification =
      await getPendingVerificationByEmail(server, email);
    if (!pendingVerification) {
        reply.status(400);
        return { error: "Pending verification not found." };
    }
    if (Date.now() > pendingVerification.expires_at.getTime()) {
        reply.status(400);
        return { error: "Passcode expired." };
    }
    if (!await verifyPassword(code, pendingVerification.code_hash)) {
        reply.status(400);
        return { error: "Invalid passcode." };
    }

    if (!await deletePendingVerificationByEmail(server, email)) {
      console.log("Unable to delete pending verification");
    }

    const userInput: NewUserInput = {
      email, name, grad_year,
      role: "member",
      password_hash: await hashPassword(password),
    };

    try {
      const newUser = await createUser(server, userInput);
      console.log(`Registered user: ${newUser.email}`)
      reply.status(201);
      return newUser;
    } catch (error: any) {
      if (error?.code === "23505") {
        console.error("Error creating user: Email already in use");
        reply.status(409);
        return { error: "Email already in use." };
      }
      console.error("Error creating user:", error);
      reply.status(500);
      return { error: "Database error occurred." };
    }
  });

}

export default authRoutes;
