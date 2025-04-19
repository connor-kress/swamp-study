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

describe("Group Routes - Input Validation & Auth", () => {
  it("GET /api/group should return 401 for missing access token", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/group",
      // No auth cookies
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });

  it("GET /api/group/:id should return 401 for missing access token", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/group/1",
      // No auth cookies
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });

  it("GET /api/group/:id should return 400 for non-numeric id", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/group/notanumber",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Invalid group id.");
  });

  it("GET /api/group/:id should return 404 for non-existent group", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/group/999999", // does not exist
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
    });
    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Group not found.");
  });
});

describe("Group Routes - Create Group Input Validation & Auth", () => {
  it("POST /api/group should return 401 for missing access token", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/group",
      payload: {
        course_id: 1,
        name: "My group",
        year: 2025,
        term: "fall",
        contact_details: "Look me up on TikTok",
      },
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });

  it("POST /api/group should return 400 for invalid request body", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/group",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
      payload: {
        // Missing required fields like name, course_id, etc.
        year: 2024,
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toHaveProperty("fieldErrors");
    expect(body.error.fieldErrors).toHaveProperty("name");
    expect(body.error.fieldErrors).toHaveProperty("course_id");
    expect(body.error.fieldErrors).toHaveProperty("term");
    expect(body.error.fieldErrors).toHaveProperty("contact_details");
  });
});

describe("Group Routes - Delete Group Input Validation & Auth", () => {
  it("DELETE /api/group/:id should return 401 for missing access token", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: "/api/group/1",
      // No auth cookies
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });

  it("DELETE /api/group/:id should return 400 for non-numeric id", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: "/api/group/notanumber",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Invalid group id.");
  });

  it("DELETE /api/group/:id should return 401 for non-owner/non-admin", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: "/api/group/1",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member", // not admin
        "x-test-user-id": "99999999", // not owner
      },
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access denied: owner only.");
  });
});

describe("Group Routes - Get UserGroup Input Validation & Auth", () => {
  it("GET /api/group/:group_id/user/:user_id should return 401 for missing access token", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/group/1/user/2",
      // No auth cookies
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });

  it("GET /api/group/:group_id/user/:user_id should return 400 for non-numeric group_id", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/group/notanumber/user/2",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toBeDefined();
  });

  it("GET /api/group/:group_id/user/:user_id should return 400 for non-numeric user_id", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/group/1/user/notanumber",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toBeDefined();
  });
});

describe("Group Routes - Add User to Group Input Validation & Auth", () => {
  it("POST /api/group/:group_id/user/:user_id should return 401 for missing access token", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/group/1/user/2",
      payload: {
        role: "member",
      },
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });

  it("POST /api/group/:group_id/user/:user_id should return 400 for non-numeric group_id", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/group/notanumber/user/2",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
      payload: {
        role: "member",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Invalid group_id or user_id.");
  });

  it("POST /api/group/:group_id/user/:user_id should return 400 for non-numeric user_id", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/group/1/user/notanumber",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
      payload: {
        role: "member",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Invalid group_id or user_id.");
  });

  it("POST /api/group/:group_id/user/:user_id should return 400 for invalid request body", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/api/group/1/user/2",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
      payload: {
        // Missing "role"
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toHaveProperty("fieldErrors");
    expect(body.error.fieldErrors).toHaveProperty("role");
  });
});

describe("Group Routes - Remove User from Group Input Validation & Auth", () => {
  it("DELETE /api/group/:group_id/user/:user_id should return 401 for missing access token", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: "/api/group/1/user/2",
      // No auth cookies
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });

  it("DELETE /api/group/:group_id/user/:user_id should return 400 for non-numeric group_id", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: "/api/group/notanumber/user/2",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Invalid group_id or user_id.");
  });

  it("DELETE /api/group/:group_id/user/:user_id should return 400 for non-numeric user_id", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: "/api/group/1/user/notanumber",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Invalid group_id or user_id.");
  });
});

describe("Group Routes - Get All Users in Group Input Validation & Auth", () => {
  it("GET /api/group/:id/users should return 401 for missing access token", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/group/1/users",
      // No auth cookies
    });
    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Access token missing.");
  });

  it("GET /api/group/:id/users should return 400 for non-numeric id", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/group/notanumber/users",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": "69",
      },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toBeDefined();
  });
});
