import { sql } from "drizzle-orm";
import { db } from "@/packages/db";

export async function checkHealth() {
  const result = await db.execute(sql`SELECT 1`);
  return result.rows[0].count === 1;
}
