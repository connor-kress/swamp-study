import { DataType, IMemoryDb, newDb } from "pg-mem";
import fs from "fs";
import path from "path";
import { Pool } from "pg";

const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
let schemaSql: string;
try {
  schemaSql = fs.readFileSync(schemaPath, "utf8");
} catch (error) {
  throw new Error(`Failed to read schema file at ${schemaPath}: ${error}`);
}

export type TestDb = {
  pool: Pool;
  db: IMemoryDb;
};

/**
 * Create a new in-memory Postgres database using pg-mem.
 */
export function createTestDb(): TestDb {
  const pgMem = newDb();

  try {
    pgMem.public.none(schemaSql);
  } catch (error) {
    throw new Error(`Failed to execute schema SQL: ${error}`);
  }
  // Register the missing function `row_to_json`
  pgMem.public.registerFunction({
    name: "row_to_json",
    args: [DataType.record],
    returns: DataType.jsonb,
    implementation: (record: any) => record,
  });

  // Mock data
  // pgMem.public.none(`INSERT INTO users (id, email, ...) VALUES (1, 'alice@ufl.edu', ...)`);

  const pgModule = pgMem.adapters.createPg();
  const pool = new pgModule.Pool();
  return { pool, db: pgMem };
}
