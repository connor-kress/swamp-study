import { describe, it, beforeAll, afterAll, expect } from "vitest";
import { buildServer } from "../src/buildServer";
import { createTestDb, TestDb } from "../src/testHelpers/setupDb";
import { Course, CourseSchema, User, UserSchema } from "../src/types";

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

async function createTestCourse(name: string): Promise<Course> {
  const createResponse = await server.inject({
    method: "POST",
    url: "/api/course",
    headers: {
      "Content-Type": "application/json",
      "x-test-auth": "1",
      "x-test-user-role": "admin",
      "x-test-user-id": "69",
    },
    payload: {
      code: `TEST${Math.floor(Math.random() * 10000)}`.slice(0, 10),
      name,
      professor: "Professor Test",
      description: `This is a test course of the name "${name}."`,
    },
  });
  expect(createResponse.statusCode).toBe(201);
  const json = JSON.parse(createResponse.payload); return CourseSchema.parse(json); }

async function createTestUser(name: string): Promise<User> {
  const createResponse = await server.inject({
    method: "POST",
    url: "/api/user/",
    headers: {
      "Content-Type": "application/json",
      "x-test-auth": "1",
      "x-test-user-role": "admin",
      "x-test-user-id": "69",
    },
    payload: {
      email: `${name}@ufl.edu`,
      password: "password123",
      name: name,
      grad_year: 2029,
      role: "member"
    },
  });
  expect(createResponse.statusCode).toBe(201);
  const json = JSON.parse(createResponse.payload);
  return UserSchema.parse(json);
}

describe("Group Integration Flow", () => {
  let user1: any, user2: any, course: any, group: any;

  it.sequential("should create a course and two users", async () => {
    course = await createTestCourse("Integration Course");
    user1 = await createTestUser("owner-user");
    user2 = await createTestUser("member-user");
    expect(course).toHaveProperty("id");
    expect(user1).toHaveProperty("id");
    expect(user2).toHaveProperty("id");
  });

  it.sequential("should create a group with user1 as owner", async () => {
    const createGroupResponse = await server.inject({
      method: "POST",
      url: "/api/group",
      headers: {
        "Content-Type": "application/json",
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": user1.id,
      },
      payload: {
        name: "Test Group",
        course_id: course.id,
        year: 2024,
        term: "fall",
        contact_details: "Contact owner-user",
      },
    });
    expect(createGroupResponse.statusCode).toBe(201);
    group = JSON.parse(createGroupResponse.payload);
    expect(group).toHaveProperty("id");
    expect(group.name).toBe("Test Group");
  });

  it.sequential("should fetch the group by id", async () => {
    const response = await server.inject({
      method: "GET",
      url: `/api/group/${group.id}`,
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": user1.id,
      },
    });
    expect(response.statusCode).toBe(200);
    const fetched = JSON.parse(response.payload);
    expect(fetched.id).toBe(group.id);
  });

  it.sequential("should fetch all groups (should include the new group)", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/group",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": user1.id,
      },
    });
    expect(response.statusCode).toBe(200);
    const groups = JSON.parse(response.payload);
    expect(Array.isArray(groups)).toBe(true);
    expect(groups.some((g: any) => g.id === group.id)).toBe(true);
  });

  it.sequential("should fetch the user group association for the owner", async () => {
    const response = await server.inject({
      method: "GET",
      url: `/api/group/${group.id}/user/${user1.id}`,
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": user1.id,
      },
    });
    expect(response.statusCode).toBe(200);
    const assoc = JSON.parse(response.payload);
    expect(assoc.user_id).toBe(user1.id);
    expect(assoc.group_id).toBe(group.id);
    expect(assoc.group_role).toBe("owner");
  });

  it.sequential("should add user2 as a member to the group", async () => {
    const response = await server.inject({
      method: "POST",
      url: `/api/group/${group.id}/user/${user2.id}`,
      headers: {
        "Content-Type": "application/json",
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": user1.id, // owner adding member
      },
      payload: {
        role: "member",
      },
    });
    expect(response.statusCode).toBe(201);
    const userGroup = JSON.parse(response.payload);
    expect(userGroup.user_id).toBe(user2.id);
    expect(userGroup.group_id).toBe(group.id);
    expect(userGroup.group_role).toBe("member");
  });

  it.sequential("should fetch all users in the group (should be 2: owner and member)", async () => {
    const response = await server.inject({
      method: "GET",
      url: `/api/group/${group.id}/users`,
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": user1.id,
      },
    });
    expect(response.statusCode).toBe(200);
    const users = JSON.parse(response.payload);
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBe(2);
    const roles = users.map((u: any) => u.group_role);
    expect(roles).toContain("owner");
    expect(roles).toContain("member");
  });

  it.sequential("should remove user2 from the group", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: `/api/group/${group.id}/user/${user2.id}`,
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": user1.id, // owner removing member
      },
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.status).toBe("success");
  });

  it.sequential("should fetch all users in the group (should be only the owner now)", async () => {
    const response = await server.inject({
      method: "GET",
      url: `/api/group/${group.id}/users`,
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": user1.id,
      },
    });
    expect(response.statusCode).toBe(200);
    const users = JSON.parse(response.payload);
    expect(users.length).toBe(1);
    expect(users[0].id).toBe(user1.id);
    expect(users[0].group_role).toBe("owner");
  });

  it.sequential("should delete the group", async () => {
    const response = await server.inject({
      method: "DELETE",
      url: `/api/group/${group.id}`,
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": user1.id, // owner deleting group
      },
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.status).toBe("success");
  });

  it.sequential("should fetch all groups (should be none)", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/group",
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": user1.id,
      },
    });
    expect(response.statusCode).toBe(200);
    const groups = JSON.parse(response.payload);
    expect(Array.isArray(groups)).toBe(true);
    expect(groups.some((g: any) => g.id === group.id)).toBe(false);
  });
});
