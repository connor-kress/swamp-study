import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
} from "../db/course";
import { verifyAccessToken, verifyAdminAccessToken } from "./auth";
import { NewCourseInputSchema } from "../types";

export const idParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

const courseRoutes: FastifyPluginAsync = async (server) => {
  // GET /course/ - Get all courses.
  server.get("/", async (_, reply) => {
    try {
      const courses = await getAllCourses(server);
      return courses;
    } catch (error) {
      reply.code(500);
      console.error(error);
      return { error: "Database error occurred." };
    }
  });

  // GET /course/:id - Get a course by id.
  server.get("/:id", async (request, reply) => {
    const parsed = idParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      reply.code(400);
      return { error: parsed.error.flatten() };
    }
    const { id } = parsed.data;
    if (isNaN(id)) {
      reply.code(400).send({ error: "Invalid course id." });
      return;
    }
    try {
      const course = await getCourseById(server, id);
      if (!course) {
        reply.code(404);
        return { error: "Course not found." };
      }
      return course;
    } catch (error) {
      reply.code(500);
      console.error(error);
      return { error: "Database error occurred." };
    }
  });

  // POST /course/ - Create a course (users only).
  server.post("/", async (request, reply) => {
    const session = await verifyAccessToken(request, reply);
    if (!session) {
      console.log("Unauthorized POST /course/");
      return;
    }
    const parsed = NewCourseInputSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400);
      return { error: parsed.error.flatten() };
    }
    const courseInput = parsed.data;
    try {
      const newCourse = await createCourse(server, courseInput);
      reply.code(201);
      return newCourse;
    } catch (error: any) {
      console.error("Error creating course:", error);
      reply.code(500);
      return { error: "Database error occurred." };
    }
  });

  // DELETE /course/:id - Delete a course (admin only).
  server.delete("/:id", async (request, reply) => {
    const parsed = idParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      reply.code(400);
      return { error: parsed.error.flatten() };
    }
    const { id } = parsed.data;
    if (isNaN(id)) {
      reply.code(400).send({ error: "Invalid course id." });
      return;
    }

    const session = await verifyAdminAccessToken(request, reply);
    if (!session) {
      console.log("Unauthorized DELETE /course/:id");
      return;
    }

    try {
      const success = await deleteCourse(server, id);
      if (!success) {
        reply.code(404);
        console.log("Attempted to delete non-existent course")
        return { error: "Course not found." };
      }
      reply.code(200);
      return { status: "success", message: `Course ${id} deleted.` };
    } catch (error) {
      console.error(`Error deleting course ${id}:`, error);
      reply.code(500);
      return { error: "Database error occurred." };
    }
  });
};

export default courseRoutes;
