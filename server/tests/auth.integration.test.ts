import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { buildServer } from '../src/buildServer';
import { createTestDb, TestDb } from './testHelpers/setupDb';
import { createUserSession, getUserByEmail } from '../src/db/queries';
import { generateNewTokenData } from '../src/routes/auth';

let server: ReturnType<typeof buildServer>;
let testDb: TestDb;

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
  testDb = createTestDb();
  server = buildServer(testDb.pool);
  await server.ready();
});

afterAll(async () => {
  await server.close();
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
    const name = 'refresh-test';
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
      method: 'GET',
      url: '/api/auth/verify',
      headers: { Cookie: cookieHeader },
    });
    expect(verifyExpiredResponse.statusCode).toBe(401);
    const verifyExpiredBody = JSON.parse(verifyExpiredResponse.payload);
    expect(verifyExpiredBody.error).toBe("Invalid or expired access token.");

    // Refresh the tokens with the refresh token
    const refreshResponse = await server.inject({
      method: 'POST',
      url: '/api/auth/refresh',
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
      method: 'GET',
      url: '/api/auth/verify',
      headers: { Cookie: newCookies },
    });
    expect(verifyValidResponse.statusCode).toBe(200);
    const verifyValidBody = JSON.parse(verifyValidResponse.payload);
    expect(verifyValidBody.user).toBeDefined();
    expect(verifyValidBody.user.email).toBe(`${name}@ufl.edu`);
  });
});
