import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { schema } from "@/packages/db/schema";
import { env } from "@/packages/env/server";

// import ws from "ws";

// neonConfig.webSocketConstructor = ws;
// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
// neonConfig.poolQueryViaFetch = true;

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
