import { loadEnvConfig } from "@next/env";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().min(1),
    BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
    HEALTH_IP_ALLOWLIST: z.string().min(1).optional(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  experimental__runtimeEnv: process.env,
});
