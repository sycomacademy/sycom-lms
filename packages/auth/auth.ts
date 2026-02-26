import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod } from "better-auth/plugins";
import { db } from "@/packages/db";
import { schema } from "@/packages/db/schema";
import { getWebsiteUrl } from "../env/utils";

const baseURL = getWebsiteUrl();
const socialProviders = {};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  baseURL,
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 1,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendOnSignUp: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  socialProviders,
  plugins: [nextCookies(), lastLoginMethod()],
});
