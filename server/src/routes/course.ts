import { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import {
  getAllCourses,
  createCourse,
  deleteCourse,
  NewCourseInput,
} from "../db/course";
import { CourseSchema } from "../types";
import { verifyAccessToken, verifyAdminAccessToken } from "./auth";

export const idParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

export const CreateCourseInputSchema = CourseSchema.omit({
  id: true,
  created_at: true,
});

const courseRoutes: FastifyPluginAsync = async (server) => {
  // GET /course/ - Get all courses.
  server.get("/", async (_, reply) => {
    try {
      const courses = await getAllCourses(server);
      return courses;
    } catch (error) {
      reply.status(500);
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
    const parsed = CreateCourseInputSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400);
      return { error: parsed.error.flatten() };
    }
    const courseInput: NewCourseInput = parsed.data;
    try {
      const newCourse = await createCourse(server, courseInput);
      reply.status(201);
      return newCourse;
    } catch (error: any) {
      console.error("Error creating course:", error);
      reply.status(500);
      return { error: "Database error occurred." };
    }
  });

  // DELETE /course/:id - Delete a course (admin only).
  server.delete("/:id", async (request, reply) => {
    const parsed = idParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      reply.status(400);
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
        reply.status(404);
        console.log("Attempted to delete non-existent course")
        return { error: "Course not found." };
      }
      reply.status(200);
      return { status: "success", message: `Course ${id} deleted.` };
    } catch (error) {
      console.error(`Error deleting course ${id}:`, error);
      reply.status(500);
      return { error: "Database error occurred." };
    }
  });
};

export default courseRoutes;
