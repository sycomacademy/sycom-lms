import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, lastLoginMethod } from "better-auth/plugins";
import { db } from "@/packages/db";
import { schema } from "@/packages/db/schema";
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
