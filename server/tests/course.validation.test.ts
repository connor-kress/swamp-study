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

describe("Course Routes - Input Validation", () => {
  it("POST /api/course should return 401 when access token is missing", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/course",
      payload: {
        code: "CEN3031",
        name: "Software Engineering",
        description: "Coding...",
      },
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });

  it("POST /api/course should return 400 for an invalid request body", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/course",
      headers: {
        "Content-Type": "application/json",
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
      payload: {
        // Missing "code" and "name"
        description: "A course",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toHaveProperty("fieldErrors");
    expect(body.error.fieldErrors).toHaveProperty("code");
    expect(body.error.fieldErrors).toHaveProperty("name");
  });

  it("DELETE /api/course/:id should return 400 for non-numeric id", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: "/api/course/notanumber",
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Invalid course id.");
  });

  it("DELETE /api/course/:id should return 401 for missing credentials", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: "/api/course/1",
      // No admin auth
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });

  it("DELETE /api/course/:id should return 401 for non-admin credentials", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: "/api/course/1",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access denied: admin only.");
  });
});
