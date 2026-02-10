import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, lastLoginMethod } from "better-auth/plugins";
import { db } from "@/packages/db";
import { schema } from "@/packages/db/schema";
import { getWebsiteUrl } from "../env/utils";
import { ac, admin, instructor, student } from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  baseURL: getWebsiteUrl(),
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {},
  plugins: [
    nextCookies(),
    lastLoginMethod(),
    adminPlugin({
      ac,
      roles: {
        admin,
        instructor,
        student,
      },
      defaultRole: "student",
    }),
  ],
});
