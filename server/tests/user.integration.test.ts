import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { buildServer } from '../src/buildServer';
import { createTestDb, TestDb } from '../src/testHelpers/setupDb';

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

describe('User API Integration', () => {
  it('should create a new user, fetch it, and then delete it', async () => {
    // CREATE
    const newUserPayload = {
      email: 'alice@ufl.edu',
      password: 'securePassword123',
      name: 'Alice',
      grad_year: 2024,
    };
    const createRes = await server.inject({
      method: 'POST',
      url: '/api/user/',
      payload: newUserPayload,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(createRes.statusCode).toBe(201);
    const createdUser = JSON.parse(createRes.payload);
    expect(createdUser).toHaveProperty('id');

    // FETCH
    const fetchRes = await server.inject({
      method: 'GET',
      url: `/api/user/${createdUser.id}`,
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": createdUser.id,
      },
    });
    expect(fetchRes.statusCode).toBe(200);
    const fetchedUser = JSON.parse(fetchRes.payload);
    expect(fetchedUser.id).toBe(createdUser.id);
    expect(fetchedUser.email).toBe(newUserPayload.email);

    // DELETE (assuming you have a DELETE route)
    const deleteRes = await server.inject({
      method: 'DELETE',
      url: `/api/user/${createdUser.id}`,
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": createdUser.id,
      },
    });
    expect(deleteRes.statusCode).toBe(200);

    // Verify user deletion
    const fetchAfterDelete = await server.inject({
      method: 'GET',
      url: `/api/user/${createdUser.id}`,
      headers: {
        "x-test-auth": "1",
        "x-test-user-role": "member",
        "x-test-user-id": createdUser.id,
      },
    });
    expect(fetchAfterDelete.statusCode).toBe(404);
  });
});
