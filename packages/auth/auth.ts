import { dash } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod } from "better-auth/plugins";
import { db } from "@/packages/db";
import {
  deleteOtherSessionsForUser,
  provisionNewUser,
  setSessionActiveOrgIfNull,
} from "@/packages/db/queries";
import { schema } from "@/packages/db/schema";
import { env } from "@/packages/env/server";
import { createLoggerWithContext } from "@/packages/utils/logger";
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

const authHookLogger = createLoggerWithContext("auth:hook");

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
        after: async (user) => {
          try {
            await provisionNewUser(db, { userId: user.id });
          } catch (error) {
            authHookLogger.error("user provisioning failed", {
              userId: user.id,
              error,
            });
          }
        },
      },
    },
    session: {
      create: {
        after: async (createdSession) => {
          try {
            await deleteOtherSessionsForUser(db, {
              userId: createdSession.userId,
              keepSessionId: createdSession.id,
            });
            if (!createdSession.activeOrganizationId) {
              await setSessionActiveOrgIfNull(db, {
                sessionId: createdSession.id,
              });
            }
          } catch (error) {
            authHookLogger.error("session hook failed", {
              sessionId: createdSession.id,
              error,
            });
          }
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
