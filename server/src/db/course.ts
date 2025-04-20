import { FastifyInstance } from "fastify";
import { Course, CourseSchema, NewCourseInput } from "../types";

export async function getAllCourses(
  server: FastifyInstance,
): Promise<Course[]> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, code, name, professor, description, created_at
      FROM courses
      ORDER BY code DESC
    `);
    return CourseSchema.array().parse(rows);
  } finally {
    client.release();
  }
}

export async function getCourseById(
  server: FastifyInstance,
  id: number,
): Promise<Course | null> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      SELECT id, code, name, professor, description, created_at
      FROM courses
      WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return null;
    return CourseSchema.parse(rows[0]);
  } finally {
    client.release();
  }
}

export async function createCourse(
  server: FastifyInstance,
  course: NewCourseInput,
): Promise<Course> {
  const client = await server.pg.connect();
  try {
    const { rows } = await client.query(`
      INSERT INTO courses (code, name, professor, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, code, name, professor, description, created_at`,
      [course.code, course.name, course.professor, course.description]
    );
    return CourseSchema.parse(rows[0]);
  } finally {
    client.release();
  }
}

export async function deleteCourse(
  server: FastifyInstance,
  id: number,
): Promise<boolean> {
  const client = await server.pg.connect();
  try {
    const { rowCount } = await client.query(
      `DELETE FROM courses WHERE id = $1`,
      [id]
    );
    return rowCount !== null && rowCount > 0;
  } finally {
    client.release();
  }
}
