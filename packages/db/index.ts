import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/packages/env/server";
import { account, session, user, verification } from "./schema/auth";
import { todo } from "./schema/todo";

// import ws from "ws";
// neonConfig.webSocketConstructor = ws;
// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
// neonConfig.poolQueryViaFetch = true;

const sql = neon(env.DATABASE_URL);
export const schema = { user, session, account, verification, todo };
export const db = drizzle(sql, { schema });
