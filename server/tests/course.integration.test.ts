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

describe("Course Routes - Integration (Happy Path)", () => {
  let createdCourse: any;

  it("POST /api/course should create a course (member)", async () => {
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
        code: "CEN3031",
        name: "Software Engineering",
        professor: "Neha",
        description: "Coding...",
      },
    });
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty("id");
    expect(body.code).toBe("CEN3031");
    expect(body.name).toBe("Software Engineering");
    expect(body.description).toBe("Coding...");
    createdCourse = body;
  });

  it("GET /api/course/:id should fetch the created course", async () => {
    const response = await server.inject({
      method: "GET",
      url: `/api/course/${createdCourse.id}`,
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.id).toBe(createdCourse.id);
    expect(body.code).toBe("CEN3031");
    expect(body.name).toBe("Software Engineering");
    expect(body.description).toBe("Coding...");
  });

  it("GET /api/course should fetch all courses (should include the created course)", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/course",
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(Array.isArray(body)).toBe(true);
    expect(body.some((c: any) => c.id === createdCourse.id)).toBe(true);
  });

  it("DELETE /api/course/:id should delete the course (admin)", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: `/api/course/${createdCourse.id}`,
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "admin",
        "x-test-user-id": "69",
      },
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.status).toBe("success");
  });

  it("GET /api/course/:id should return 404 after deletion", async () => {
    const response = await server.inject({
      method: "GET",
      url: `/api/course/${createdCourse.id}`,
    });
    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Course not found.");
  });
});
