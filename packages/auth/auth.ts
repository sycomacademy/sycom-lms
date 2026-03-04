import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod } from "better-auth/plugins";
import { db } from "@/packages/db";
import { schema } from "@/packages/db/schema";
import { env } from "@/packages/env/server";
import {
  adminPlugin,
  afterEmailVerification,
  baseURL,
  organizationPlugin,
  passkeyPlugin,
  scimPlugin,
  sendResetPassword,
  sendVerificationEmail,
  ssoPlugin,
  twoFactorPlugin,
} from "./config";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  appName: "Sycom Solutions LMS",
  baseURL,
  trustedOrigins: [baseURL], // TODO: Add trusted origins
  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    ipAddress: {
      // Use Vercel's forwarded-for header in production, Cloudflare's in development (for tunneling)
      ipAddressHeaders: [
        process.env.NODE_ENV === "production"
          ? "x-vercel-forwarded-for"
          : "cf-connecting-ip",
        // "x-forwarded-for",
      ],
    },
  },
  experimental: {
    joins: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "linkedin"],
    },
  },
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 1,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (_user) => {
          //add user to public org
          //add user to public cohort
          //create profile field
        },
      },
    },
    session: {
      create: {
        after: async (_createdSession) => {
          //delete other sessions
          // if no active organization, set active organization and cohort to public org and cohorts
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword,
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: "platform_student",
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail,
    sendOnSignUp: false,
    afterEmailVerification,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      prompt: "select_account",
    },
    linkedin: {
      clientId: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
    },
  },
  plugins: [
    dash(),
    nextCookies(),
    lastLoginMethod(),
    passkeyPlugin,
    twoFactorPlugin,
    adminPlugin,
    organizationPlugin,
    ssoPlugin,
    scimPlugin,
  ],
});
