import { describe, it, beforeAll, beforeEach, afterAll, expect } from "vitest";
import { buildServer } from "../src/buildServer";
import { createTestDb, TestDb } from "../src/testHelpers/setupDb";
import {
  createUserSession,
  getPendingVerificationByEmail,
  getUserByEmail,
} from "../src/db/queries";
import { generateNewTokenData } from "../src/routes/auth";
import { MockEmailService } from "../src/services/email/MockEmailService";

let server: ReturnType<typeof buildServer>;
let testDb: TestDb;
let mockEmailService: MockEmailService;

async function createTestUser(name: string) {
  const createResponse = await server.inject({
    method: "POST",
    url: "/api/user/",
    headers: { "Content-Type": "application/json" },
    payload: {
      email: `${name}@ufl.edu`,
      password: "password123",
      name: name,
      grad_year: 2029,
    },
  });
  expect(createResponse.statusCode).toBe(201);
}

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  testDb = createTestDb();
  server = buildServer(testDb.pool);
  await server.ready();
  mockEmailService = server.emailService as MockEmailService;
});

beforeEach(() => {
  mockEmailService.clearSentEmails();
});

afterAll(async () => {
  await server.close();
  await testDb.pool.end();
});

describe("Authentication Integration", () => {
  it("should fail login with an invalid password", async () => {
    const name = "login-fail";
    await createTestUser(name);
    // Attempt login with the wrong password.
    const loginResponse = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      headers: { "Content-Type": "application/json" },
      payload: {
        email: `${name}@ufl.edu`,
        password: "wrongpassword",
      },
    });
    expect(loginResponse.statusCode).toBe(200);
    const loginBody = JSON.parse(loginResponse.payload);
    expect(loginBody.error).toBe("Invalid password.");
  });

  it("should login successfully with a valid password and then verify the user", async () => {
    const name = "login-success";
    await createTestUser(name);
    // Log in with the correct credentials
    const loginResponse = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      headers: { "Content-Type": "application/json" },
      payload: {
        email: `${name}@ufl.edu`,
        password: "password123",
      },
    });
    expect(loginResponse.statusCode).toBe(200);
    const loginBody = JSON.parse(loginResponse.payload);
    expect(loginBody.message).toBe("Login successful");

    // Log in to obtain valid cookies
    let setCookies = loginResponse.headers["set-cookie"];
    expect(setCookies).toBeDefined();
    if (Array.isArray(setCookies)) {
      setCookies = setCookies.join("; ")
    }

    // Use cookies to verify session
    const verifyResponse = await server.inject({
      method: "GET",
      url: "/api/auth/verify",
      headers: { Cookie: setCookies },
    });
    expect(verifyResponse.statusCode).toBe(200);
    const verifyBody = JSON.parse(verifyResponse.payload);
    expect(verifyBody.user).toBeDefined();
    expect(verifyBody.user.email).toBe(`${name}@ufl.edu`);
  });

  it("should logout successfully, clearing auth cookies", async () => {
    const name = "logout-success";
    await createTestUser(name);
    // Log in to obtain valid cookies
    const loginResponse = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      headers: { "Content-Type": "application/json" },
      payload: {
        email: `${name}@ufl.edu`,
        password: "password123",
      },
    });
    expect(loginResponse.statusCode).toBe(200);
    let setCookies = loginResponse.headers["set-cookie"];
    expect(setCookies).toBeDefined();
    if (Array.isArray(setCookies)) {
      setCookies = setCookies.join("; ")
    }

    // Log out using cookies
    const logoutResponse = await server.inject({
      method: "POST",
      url: "/api/auth/logout",
      headers: { Cookie: setCookies },
    });
    expect(logoutResponse.statusCode).toBe(200);
    const logoutBody = JSON.parse(logoutResponse.payload);
    expect(logoutBody.message).toBe("Logged out successfully.");

    // Verify that the cookies are cleared
    const clearedCookies = logoutResponse.headers["set-cookie"];
    expect(clearedCookies).toBeDefined();
  });

  it("should refresh expired access token, ensuring it works", async () => {
    const name = "refresh-test";
    await createTestUser(name);
    const user = await getUserByEmail(server, `${name}@ufl.edu`);
    expect(user).toBeDefined();
    if (!user) return; // for typing

    const tokenData = generateNewTokenData();
    tokenData.accessExpires = new Date(Date.now() - 60*1000); // expired
    tokenData.refreshExpires = new Date(Date.now() + 3600*1000); // valid

    // Create user session with expired access token
    const userSession = await createUserSession(server, user.id, tokenData);
    expect(userSession.user_id).toBe(user.id);

    const cookieHeader = `accessToken=${tokenData.accessToken}; refreshToken=${tokenData.refreshToken}`;

    // Ensure that access token is indeed expired
    const verifyExpiredResponse = await server.inject({
      method: "GET",
      url: "/api/auth/verify",
      headers: { Cookie: cookieHeader },
    });
    expect(verifyExpiredResponse.statusCode).toBe(401);
    const verifyExpiredBody = JSON.parse(verifyExpiredResponse.payload);
    expect(verifyExpiredBody.error).toBe("Invalid or expired access token.");

    // Refresh the tokens with the refresh token
    const refreshResponse = await server.inject({
      method: "POST",
      url: "/api/auth/refresh",
      headers: { Cookie: cookieHeader },
    });
    expect(refreshResponse.statusCode).toBe(200);
    const refreshBody = JSON.parse(refreshResponse.payload);
    expect(refreshBody.status).toBe("success");
    expect(refreshBody.data).toBeDefined();

    let newCookies = refreshResponse.headers["set-cookie"];
    expect(newCookies).toBeDefined();
    if (Array.isArray(newCookies)) {
      newCookies = newCookies.join("; ");
    }
    // Check if the new tokens are different
    expect(newCookies).not.toContain(tokenData.accessToken);
    expect(newCookies).not.toContain(tokenData.refreshToken);

    // Ensure that the new access token is valid
    const verifyValidResponse = await server.inject({
      method: "GET",
      url: "/api/auth/verify",
      headers: { Cookie: newCookies },
    });
    expect(verifyValidResponse.statusCode).toBe(200);
    const verifyValidBody = JSON.parse(verifyValidResponse.payload);
    expect(verifyValidBody.user).toBeDefined();
    expect(verifyValidBody.user.email).toBe(`${name}@ufl.edu`);
  });
});

describe("Registration Flow Integration", () => {
  const testUserEmail = "register.test@ufl.edu";
  const testUserName = "Reg Tester";
  const testUserPassword = "passwordStrong!";
  const testUserGradYear = 2028;

  it("should request signup code successfully for a new email", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/auth/request-signup-code",
      payload: {
        email: testUserEmail,
        name: testUserName,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({
      message: "Verification code sent to your email.",
    });

    // Check mock email service
    expect(mockEmailService.sentEmails.length).toBe(1);
    const sentData = mockEmailService.getLastSentEmail();
    expect(sentData?.email).toBe(testUserEmail);
    expect(sentData?.name).toBe(testUserName);
    expect(sentData?.code).toMatch(/^\d{6}$/); // Assumes 6-digit code

    // Check database state
    const pending = await getPendingVerificationByEmail(server, testUserEmail);
    expect(pending).not.toBeNull();
    expect(pending?.email).toBe(testUserEmail);
    expect(pending?.expires_at.getTime()).toBeGreaterThan(Date.now());
  });

  it("should fail to request signup code if email is already registered", async () => {
    // 1. Create user first (using admin helper or direct insert)
    const name = "existing.user"
    const existingEmail = `${name}@ufl.edu`;
    await createTestUser(name);

    // 2. Attempt to request code for the same email
    const response = await server.inject({
      method: "POST",
      url: "/api/auth/request-signup-code",
      payload: {
        email: existingEmail,
        name: "Another Name",
      },
    });

    expect(response.statusCode).toBe(409); // conflict
    expect(JSON.parse(response.payload)).toEqual({
      error: "Email already in use.",
    });

    // Check mock email service was NOT called
    expect(mockEmailService.sentEmails.length).toBe(0);
  });

  it("should register successfully with a valid code", async () => {
    // 1. Request code first
    const requestCodeResponse = await server.inject({
      method: "POST",
      url: "/api/auth/request-signup-code",
      payload: {
        email: "register.success@ufl.edu",
        name: "Success User",
      },
    });
    expect(requestCodeResponse.statusCode).toBe(200);
    const code = mockEmailService.findCodeForEmail(
      "register.success@ufl.edu",
    );
    expect(code).toBeDefined();

    // 2. Register using the code
    const registerResponse = await server.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "register.success@ufl.edu",
        name: "Success User",
        password: testUserPassword,
        grad_year: testUserGradYear,
        code: code,
      },
    });

    expect(registerResponse.statusCode).toBe(201);
    const registerBody = JSON.parse(registerResponse.payload);
    expect(registerBody.email).toBe("register.success@ufl.edu");
    expect(registerBody.name).toBe("Success User");
    expect(registerBody.role).toBe("member");
    expect(registerBody.password_hash).toBeUndefined(); // security!

    // 3. Verify user exists in DB
    const dbUser = await getUserByEmail(
      server, "register.success@ufl.edu",
    );
    expect(dbUser).toBeDefined();
    expect(dbUser?.name).toBe("Success User");

    // 4. Verify pending verification was deleted (important!)
    const pending = await getPendingVerificationByEmail(
      server, "register.success@ufl.edu",
    );
    expect(pending).toBeNull();
  });

  it("should fail registration if pending verification is not found", async () => {
    // Never requested a code
    const response = await server.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "not.requested@ufl.edu",
        name: "No Request",
        password: testUserPassword,
        grad_year: testUserGradYear,
        code: "123456", // arbitrary code
      },
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.payload)).toEqual({
      error: "Pending verification not found.",
    });
  });

  it("should fail registration with an invalid code", async () => {
    // 1. Request code
    const email = "invalid.code@ufl.edu";
    await server.inject({
      method: "POST",
      url: "/api/auth/request-signup-code",
      payload: { email: email, name: "Invalid Coder" },
    });
    const correctCode = mockEmailService.findCodeForEmail(email);
    expect(correctCode).toBeDefined();

    // 2. Attempt registration with wrong code
    const response = await server.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: email,
        name: "Invalid Code Guy",
        password: testUserPassword,
        grad_year: testUserGradYear,
        code: "000000", // wrong code
      },
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.payload)).toEqual({
      error: "Invalid passcode.",
    });

    // Pending verification still exists
    const pending = await getPendingVerificationByEmail(server, email);
    expect(pending).not.toBeNull();
  });

  it("should fail registration with an expired code", async () => {
    const email = "expired.code@ufl.edu";
    await server.inject({
      method: "POST",
      url: "/api/auth/request-signup-code",
      payload: { email: email, name: "Expired Code Guy" },
    });
    const code = mockEmailService.findCodeForEmail(email);
    expect(code).toBeDefined();

    // 2. Manually expire the code in the database
    const client = await testDb.pool.connect();
    try {
      await client.query(`
        UPDATE pending_verifications
        SET expires_at = NOW() - interval '1 second'
        WHERE email = $1`,
        [email],
      );
    } finally {
      client.release();
    }

    // 3. Attempt registration
    const response = await server.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: email,
        name: "Expired Code Guy",
        password: testUserPassword,
        grad_year: testUserGradYear,
        code: code, // correct, but expired
      },
    });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.payload)).toEqual({
      error: "Passcode expired.",
    });
  });
});
