import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { schema } from "@/packages/db/schema";
import { env } from "@/packages/env/server";

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });

export type Database = typeof db;
