import { SessionWithUser } from "../types";

export function getTestingSession(
  userId: number,
  isAdmin: boolean,
  name?: string,
): SessionWithUser {
  return {
    session: {
      id: isAdmin ? 777 : 111,
      user_id: userId,
      access_token: isAdmin ? "mock-admin-token" : "mock-member-token",
      refresh_token: isAdmin ? "mock-admin-token" : "mock-member-token",
      access_expires: new Date(Date.now() + 15*60*1000),
      refresh_expires: new Date(Date.now() + 7*24*60*60*1000),
      created_at: new Date(Date.now()),
      updated_at: new Date(Date.now()),
    },
    user: {
      id: userId,
      email: name ? `${name}@ufl.edu`
                  : (isAdmin ? "admin@ufl.edu" : "member@ufl.edu"),
      name: name ?? (isAdmin ? "Testing Admin" : "Testing Member"),
      grad_year: 2029,
      role: isAdmin ? "admin" : "member",
      created_at: new Date(Date.now()),
    },
  };
}
