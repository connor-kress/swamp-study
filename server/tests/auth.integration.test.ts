import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { buildServer } from '../src/buildServer';
import { createTestDb, TestDb } from '../src/testHelpers/setupDb';

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
    if (typeof setCookies === "object") {
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
    if (typeof setCookies === "object") {
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
});
