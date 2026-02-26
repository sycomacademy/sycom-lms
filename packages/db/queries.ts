import { sql } from "drizzle-orm";
import type { Database } from "@/packages/db";
import { db } from "@/packages/db";

export async function checkHealth(database: Database = db) {
  await database.execute(sql`SELECT 1`);
  return true;
}
