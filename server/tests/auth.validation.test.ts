import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { buildServer } from "../src/buildServer";
import { createTestDb, TestDb } from "../src/testHelpers/setupDb";

let server: ReturnType<typeof buildServer>;
let testDb: TestDb;

beforeAll(async () => {
  testDb = createTestDb();
  server = buildServer(testDb.pool);
  await server.ready();
});

afterAll(async () => {
  await server.close();
});

describe("Auth Routes - Input Validation", () => {
  it("GET /api/auth/verify should return 401 when access token is missing", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/auth/verify",
      // No cookies are provided so no accessToken is set.
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });

  it("POST /api/auth/login should return 400 for an invalid request body", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/auth/login",
      headers: {
        "Content-Type": "application/json",
        "x-test-override-rate-limit": "1",
      },
      // Missing the required "password" field
      payload: { email: "test@example.com" },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    // Expect the flattened error object to include a flag for "password"
    expect(body.error).toHaveProperty("fieldErrors");
    expect(body.error.fieldErrors).toHaveProperty("password");
  });

  it("POST /api/auth/refresh should return 401 when refresh token is missing", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/auth/refresh",
      // No cookies provided so no refreshToken exists
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Refresh token missing.");
  });

  it("POST /api/auth/logout should return 401 when access token is missing", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/auth/logout",
      // No access token provided in cookies
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });

  it("POST /api/auth/logout-all should return 401 when access token is missing", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/auth/logout-all",
      // No access token provided in cookies
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });
});
