import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { createGroupWithOwner, deleteGroup, getAllGroups, getGroupById, getUserGroupRole, NewGroupInput } from "../db/group";
import { GroupSchema } from "../types";
import { verifyAccessToken } from "./auth";

export const idParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

export const CreateGroupInputSchema = GroupSchema.omit({
  id: true,
  created_at: true,
});

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
    const groupIdParsed = idParamsSchema.safeParse({
      id: (request.params as any).group_id
    });
    const userIdParsed = idParamsSchema.safeParse({
      id: (request.params as any).user_id
    });
    if (!groupIdParsed.success || !userIdParsed.success) {
      reply.status(400);
      return { error: "Invalid group_id or user_id." };
    }
    const group_id = groupIdParsed.data.id;
    const user_id = userIdParsed.data.id;

    const session = await verifyAccessToken(request, reply);
    if (!session) {
      console.log("Unauthorized GET /group/:group_id/user/:user_id");
      return;
    }

    try {
      const userGroup = await getUserGroupRole(server, user_id, group_id);
      if (!userGroup) {
        reply.status(404);
        return { error: "No user found in group." };
      }
      return userGroup;
    } catch (error) {
      reply.status(500);
      console.error(error);
      return { error: "Database error occurred." };
    }
  });

  // TODO: add to group, remove from group, get all users in group
};

export default groupRoutes;
