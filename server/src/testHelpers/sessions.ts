import { SessionWithUser } from "../types";

export function getTestingMemberSession(userId: number): SessionWithUser {
  return {
    session: {
      id: 111,
      user_id: userId,
      access_token: "mock-member-token",
      refresh_token: "mock-member-token",
      access_expires: new Date(Date.now() + 15*60*1000),
      refresh_expires: new Date(Date.now() + 7*24*60*60*1000),
      created_at: new Date(Date.now()),
      updated_at: new Date(Date.now()),
    },
    user: {
      id: userId,
      email: "member@ufl.edu",
      name: "Testing Member",
      grad_year: 2029,
      role: "member",
      created_at: new Date(Date.now()),
    },
  };
}

export function getTestingAdminSession(userId: number): SessionWithUser {
  return {
    session: {
      id: 777,
      user_id: userId,
      access_token: "mock-admin-token",
      refresh_token: "mock-admin-token",
      access_expires: new Date(Date.now() + 15*60*1000),
      refresh_expires: new Date(Date.now() + 7*24*60*60*1000),
      created_at: new Date(Date.now()),
      updated_at: new Date(Date.now()),
    },
    user: {
      id: userId,
      email: "admin@ufl.edu",
      name: "Testing Admin",
      grad_year: 2029,
      role: "admin",
      created_at: new Date(Date.now()),
    },
  };
}
