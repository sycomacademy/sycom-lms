import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, lastLoginMethod } from "better-auth/plugins";
import { twoFactor } from "better-auth/plugins/two-factor";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/packages/db";
import { schema } from "@/packages/db/schema";
import { session } from "@/packages/db/schema/auth";
import { profile } from "@/packages/db/schema/profile";
import { render } from "@/packages/email/render";
import { sendEmail } from "@/packages/email/resend";
import { ResetPasswordEmail } from "@/packages/email/templates/reset-password";
import { VerifyEmail } from "@/packages/email/templates/verify-email";
import { getWebsiteUrl } from "../env/utils";
import { ac, admin, instructor, student } from "./permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  baseURL: getWebsiteUrl(),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db
            .insert(profile)
            .values({
              id: crypto.randomUUID(),
              userId: user.id,
              bio: "",
            })
            .onConflictDoNothing({ target: profile.userId });
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const html = await render(
        ResetPasswordEmail({
          name: user.name,
          resetUrl: url,
        })
      );
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        html,
      });
    },
    revokeSessionsOnPasswordReset: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const html = await render(
        VerifyEmail({
          name: user.name,
          verifyUrl: url,
        })
      );
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        html,
      });
    },
  },
  socialProviders: {},
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const newSession = ctx.context.newSession;
      if (!(newSession?.session?.id && newSession?.user?.id)) {
        return;
      }

      const isLoginFlow =
        ctx.path.startsWith("/sign-in") ||
        ctx.path.startsWith("/two-factor/verify");

      if (!isLoginFlow) {
        return;
      }

      await db
        .delete(session)
        .where(
          and(
            eq(session.userId, newSession.user.id),
            ne(session.id, newSession.session.id)
          )
        );
    }),
  },
  plugins: [
    nextCookies(),
    lastLoginMethod(),
    passkey({
      rpID:
        process.env.NODE_ENV === "production"
          ? new URL(getWebsiteUrl()).hostname
          : "localhost",
      rpName: "Sycom LMS",
      origin: getWebsiteUrl(),
    }),
    twoFactor({
      issuer: "Sycom LMS",
    }),
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
