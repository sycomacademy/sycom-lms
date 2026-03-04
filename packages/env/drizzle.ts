/**
 * Minimal env for Drizzle CLI (generate, migrate, push, studio).
 * Only DATABASE_URL is required; so github workflows can run migrations.
 */
import { loadEnvConfig } from "@next/env";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
});
