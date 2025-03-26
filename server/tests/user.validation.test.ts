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
