import { newDb } from "pg-mem";
import fs from "fs";
import path from "path";
import { Pool } from "pg";

/**
 * Create a new in-memory Postgres database using pg-mem.
 */
export function createTestDb(): Pool {
  const pgMem = newDb();

  const schemaPath = path.join(__dirname, "..", "src", "db", "schema.sql");
  let schemaSql: string;
  try {
    schemaSql = fs.readFileSync(schemaPath, "utf8");
  } catch (error) {
    throw new Error(`Failed to read schema file at ${schemaPath}: ${error}`);
  }

  try {
    pgMem.public.none(schemaSql);
  } catch (error) {
    throw new Error(`Failed to execute schema SQL: ${error}`);
  }

  // Mock data
  // pgMem.public.none(`INSERT INTO users (id, email, ...) VALUES (1, 'alice@ufl.edu', ...)`);

  const pgModule = pgMem.adapters.createPg();
  const pool = new pgModule.Pool();
  return pool;
}
