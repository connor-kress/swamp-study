import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import {
  addUserToGroup,
  createGroupWithOwner,
  deleteGroup,
  getAllGroups,
  getGroupById,
  getUserGroupRole,
  getUsersInGroup,
  NewGroupInput,
  removeUserFromGroup,
} from "../db/group";
import { GroupSchema, SessionWithUser, UserGroupRoleEnum } from "../types";
import { verifyAccessToken, verifyAdminAccessToken } from "./auth";

export const idParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

export const CreateGroupInputSchema = GroupSchema.omit({
  id: true,
  created_at: true,
});

function getGroupAndUserIdParams(
  request: FastifyRequest,
  reply: FastifyReply,
): { group_id: number, user_id: number }
  | { group_id: null, user_id: null } {
    const groupIdParsed = idParamsSchema.safeParse({
      id: (request.params as any).group_id,
    });
    const userIdParsed = idParamsSchema.safeParse({
      id: (request.params as any).user_id,
    });
    if (!groupIdParsed.success || !userIdParsed.success
      || isNaN(groupIdParsed.data.id) || isNaN(userIdParsed.data.id)) {
      reply.code(400).send({ error: "Invalid group_id or user_id." });
      return { group_id: null, user_id: null };
    }
    return {
      group_id: groupIdParsed.data.id,
      user_id: userIdParsed.data.id,
    };
}

const groupRoutes: FastifyPluginAsync = async (server) => {
  // GET /group/ - Get all groups.
  server.get("/", async (request, reply) => {
    const session = await verifyAccessToken(request, reply);
    if (!session) {
      console.log("Unauthorized GET /group/");
      return;
    }

    try {
      const groups = await getAllGroups(server);
      return groups;
    } catch (error) {
      reply.code(500);
      console.error(error);
      return { error: "Database error occurred." };
    }
  });

  // GET /group/:id - Get a group by id.
  server.get("/:id", async (request, reply) => {
    const parsed = idParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      reply.code(400);
      return { error: parsed.error.flatten() };
    }
    const { id } = parsed.data;
    if (isNaN(id)) {
      reply.code(400).send({ error: "Invalid group id." });
      return;
    }

    const session = await verifyAccessToken(request, reply);
    if (!session) {
      console.log("Unauthorized GET /group/:id");
      return;
    }

    try {
      const group = await getGroupById(server, id);
      if (!group) {
        reply.code(404);
        return { error: "Group not found." };
      }
      return group;
    } catch (error) {
      reply.code(500);
      console.error(error);
      return { error: "Database error occurred." };
    }
  });

  // POST /group/ - Create a group.
  server.post("/", async (request, reply) => {
    const parsed = CreateGroupInputSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400);
      return { error: parsed.error.flatten() };
    }
    const groupInput: NewGroupInput = parsed.data;
    const session = await verifyAccessToken(request, reply);
    if (!session) {
      console.log("Unauthorized POST /group/");
      return;
    }
    try {
      const newGroup = await createGroupWithOwner(
        server, groupInput, session.user.id
      );
      reply.code(201);
      return newGroup.group;
    } catch (error) {
      console.error("Error creating group:", error);
      reply.code(500);
      return { error: "Database error occurred." };
    }
  });

  // DELETE /group/:id - Delete a group (owner and admin only).
  server.delete("/:id", async (request, reply) => {
    const parsed = idParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      reply.code(400);
      return { error: parsed.error.flatten() };
    }
    const { id } = parsed.data;
    if (isNaN(id)) {
      reply.code(400).send({ error: "Invalid group id." });
      return;
    }

    const session = await verifyAccessToken(request, reply);
    if (!session) {
      console.log("Unauthorized DELETE /group/:id");
      return;
    }
    if (session.user.role !== "admin") {
      const userGroup = await getUserGroupRole(
        server, session.user.id, id
      );
      if (!userGroup || userGroup.group_role != "owner") {
        reply.code(401).send({
          error: "Access denied: owner only.",
        });
        console.log("Unauthorized DELETE /group/:id");
        return;
      }
    }

    try {
      const success = await deleteGroup(server, id);
      if (!success) {
        reply.code(404);
        console.log("Attempted to delete non-existent group")
        return { error: "Group not found." };
      }
      reply.code(200);
      return { status: "success", message: `Group ${id} deleted.` };
    } catch (error) {
      console.error(`Error deleting group ${id}:`, error);
      reply.code(500);
      return { error: "Database error occurred." };
    }
  });


  // GET /group/:group_id/user/:user_id - Get a user's group association.
  server.get("/:group_id/user/:user_id", async (request, reply) => {
    const { group_id, user_id } = getGroupAndUserIdParams(request, reply);
    if (!group_id || !user_id) return;
    const session = await verifyAccessToken(request, reply);
    if (!session) {
      console.log("Unauthorized GET /group/:group_id/user/:user_id");
      return;
    }

    try {
      const userGroup = await getUserGroupRole(server, user_id, group_id);
      if (!userGroup) {
        reply.code(404);
        return { error: "No user found in group." };
      }
      return userGroup;
    } catch (error) {
      reply.code(500);
      console.error(error);
      return { error: "Database error occurred." };
    }
  });

  const AddUserToGroupBodySchema = z.object({
    role: UserGroupRoleEnum,
  });

  // POST /group/:group_id/user/:user_id - Add a user to a group.
  server.post("/:group_id/user/:user_id", async (request, reply) => {
    const { group_id, user_id } = getGroupAndUserIdParams(request, reply);
    if (!group_id || !user_id) return;
    const parsedBody = AddUserToGroupBodySchema.safeParse(request.body);
    if (!parsedBody.success) {
      reply.code(400);
      return { error: parsedBody.error.flatten() };
    }
    const { role } = parsedBody.data;

    let session: SessionWithUser | null;
    if (role === "owner") {
      session = await verifyAdminAccessToken(request, reply);
    } else {
      session = await verifyAccessToken(request, reply);
    }
    if (!session) {
      console.log("Unauthorized POST /group/:group_id/user/:user_id");
      return;
    }

    try {
      const userGroup = await addUserToGroup(server, user_id, group_id, role);
      reply.code(201);
      return userGroup;
    } catch (error) {
      reply.code(500);
      console.error(error);
      return { error: "Database error occurred." };
    }
  });

  // DELETE /group/:group_id/user/:user_id - Remove a user from a group.
  // Only the group owner, an admin, or the user themselves can remove a
  // user from the group.
  server.delete("/:group_id/user/:user_id", async (request, reply) => {
    const { group_id, user_id } = getGroupAndUserIdParams(request, reply);
    if (!group_id || !user_id) return;

    // Get the user's group role
    let userGroup;
    try {
      userGroup = await getUserGroupRole(server, user_id, group_id);
      if (!userGroup) {
        reply.code(404);
        return { error: "No user found in group." };
      }
    } catch (error) {
      reply.code(500);
      console.error(error);
      return { error: "Database error occurred." };
    }

    // Enforce permissions
    let session = await verifyAccessToken(request, reply);
    if (!session) {
      console.log("Unauthorized DELETE /group/:group_id/user/:user_id");
      return;
    }
    if (session.user.role !== "admin" && session.user.id !== user_id) {
      const currentUserRole = await getUserGroupRole(
        server, session.user.id, group_id
      );
      if (!currentUserRole || currentUserRole.group_role !== "owner") {
        console.log("Unauthorized DELETE /group/:group_id/user/:user_id");
        reply.code(403);
        return { error: "Invalid credentials for action." };
      }
    }

    try {
      const removed = await removeUserFromGroup(server, user_id, group_id);
      if (!removed) {
        // This should not happen as we already verified they are in the group
        throw new Error("Unknown database error removing user from group.");
      }
      reply.code(200);
      return {
        status: "success",
        message: `User ${user_id} removed from group ${group_id}.`,
      };
    } catch (error) {
      reply.code(500);
      console.error(error);
      return { error: "Database error occurred." };
    }
  });


  // GET /group/:id/users - Get all users in a group and their roles
  server.get("/:id/users", async (request, reply) => {
    const parsed = idParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      reply.code(400);
      return { error: parsed.error.flatten() };
    }
    const { id } = parsed.data;
    if (isNaN(id)) {
      reply.code(400).send({ error: "Invalid group id." });
      return;
    }
    const session = await verifyAccessToken(request, reply);
    if (!session) {
      console.log("Unauthorized GET /group/:id/user");
      return;
    }

    try {
      const users = await getUsersInGroup(server, id);
      return users;
    } catch (error) {
      reply.code(500);
      console.error(error);
      return { error: "Database error occurred." };
    }
  });
};

export default groupRoutes;
