import type { Config } from "drizzle-kit";
import { env } from "@/packages/env/server";

export default {
	schema: ["packages/db/schema/*"],
	out: "packages/db/migrations",
	dialect: "postgresql",
	dbCredentials: { url: env.DATABASE_URL },
} satisfies Config;
