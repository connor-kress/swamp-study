import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { buildServer } from "../src/buildServer";

let server: ReturnType<typeof buildServer>;

beforeAll(async () => {
  server = buildServer();
  await server.ready();
});

afterAll(async () => {
  await server.close();
});

describe("Create User Input Validation", () => {
  it("should return 400 for invalid email format", async () => {
    const invalidEmailPayload = {
      email: "not-an-email",
      password: "securePassword123",
      name: "Alice",
      grad_year: 2024,
    };
    const response = await server.inject({
      method: "POST",
      url: "/api/user/",
      payload: invalidEmailPayload,
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toHaveProperty("fieldErrors");
    expect(body.error.fieldErrors).toHaveProperty("email");
  });

  it("should return 400 when grad_year is not a number", async () => {
    const invalidGradYearPayload = {
      email: "alice@example.com",
      password: "securePassword123",
      name: "Alice",
      grad_year: "2024", // Incorrect type: should be a number.
    };

    const response = await server.inject({
      method: "POST",
      url: "/api/user/",
      payload: invalidGradYearPayload,
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.payload);
    expect(body.error).toHaveProperty("fieldErrors");
    expect(body.error.fieldErrors).toHaveProperty("grad_year");
  });

  it("should return 400 for missing required fields", async () => {
    const missingFieldPayload = {
      email: "alice@example.com",
      name: "Alice",
      grad_year: 2024,
      // Missing password
    };
    const response = await server.inject({
      method: "POST",
      url: "/api/user/",
      payload: missingFieldPayload,
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toHaveProperty("fieldErrors");
    expect(body.error.fieldErrors).toHaveProperty("password");
  });

  it("should not return 400 for valid input", async () => {
    const validPayload = {
      email: "alice@example.com",
      password: "securePassword123",
      name: "Alice",
      grad_year: 2024,
    };
    const response = await server.inject({
      method: "POST",
      url: "/api/user/",
      payload: validPayload,
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(response.statusCode).not.toBe(400);
  });
});

describe("GET /api/user/:id - Route Behavior", () => {
  it("should return 401 when unauthorized", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/user/1",
      headers: { "Content-Type": "application/json" },
      // no cookies or testing override headers
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });

  it("should return 400 when provided a non-numeric id", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/user/abc", // invalid id, transforms to NaN
      headers: {
        "Content-Type": "application/json",
        "x-test-auth": "1",
        "x-test-user-role": "admin",
        "x-test-user-id": "1",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Invalid user id.");
  });

  it("should return 404 when provided a non-existent id", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/user/69696969", // id does not exist
      headers: {
        "Content-Type": "application/json",
        "x-test-auth": "1",
        "x-test-user-role": "admin",
        "x-test-user-id": "1",
      },
    });
    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("User not found.");
  });

  it("should return 401 when a non-admin cross-member access", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/user/10",
      headers: {
        "Content-Type": "application/json",
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "5",  // different from queried user id
      },
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Invalid credentials for account.");
  });
});
