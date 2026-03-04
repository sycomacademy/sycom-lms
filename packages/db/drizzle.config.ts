import type { Config } from "drizzle-kit";

//using process.env.DATABASE_URL for CI workflows
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. In CI it is set by the workflowe");
}

export default {
  schema: ["packages/db/helper.ts", "packages/db/schema/*"],
  out: "packages/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
} satisfies Config;
