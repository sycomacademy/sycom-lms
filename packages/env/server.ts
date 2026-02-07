import { loadEnvConfig } from "@next/env";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    LINKEDIN_CLIENT_ID: z.string().min(1),
    LINKEDIN_CLIENT_SECRET: z.string().min(1),
    SENDGRID_API_KEY: z.string().min(1),
    SENDGRID_FROM_EMAIL: z.string().email(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  experimental__runtimeEnv: process.env,
});

export function getWebsiteUrl() {
  if (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  ) {
    return `https://${process.env.VERCEL_URL}`; //replace with the actual domain
  }

  if (
    process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "staging"
  ) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
