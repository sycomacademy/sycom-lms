import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  client: {},
  runtimeEnv: {},
});

export function getWebsiteUrl() {
  if (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  ) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`; //replace with the actual domain
  }

  if (
    process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "staging"
  ) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
