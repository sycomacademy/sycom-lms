/** biome-ignore-all lint/complexity/noVoid: we don't want to await these functions. see https://www.better-auth.com/docs/concepts/email#1-during-sign-up */

import { tasks } from "@trigger.dev/sdk";
import { APIError, betterAuth, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod } from "better-auth/plugins";
import { db } from "@/packages/db";
import { schema } from "@/packages/db/schema";
import { render } from "@/packages/email/render";
import { sendEmail } from "@/packages/email/resend";
import { ResetPasswordEmail } from "@/packages/email/templates/reset-password";
import { VerifyEmail } from "@/packages/email/templates/verify-email";
import { env } from "@/packages/env/server";
import { getWebsiteUrl } from "@/packages/env/utils";
import type { welcomeEmailTask } from "@/packages/trigger/tasks/welcome-email";

const baseURL = getWebsiteUrl();

const sendVerificationEmail = async ({
  user,
  url,
}: {
  user: User;
  url: string;
}) => {
  const { error } = await sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: await render(VerifyEmail({ name: user.name, verifyUrl: url })),
  });
  if (error) {
    throw new APIError("BAD_REQUEST", {
      message: `Error sending verification email: ${error.message}`,
    });
  }
};

const sendResetPassword = async ({
  user,
  url,
}: {
  user: User;
  url: string;
}) => {
  const { error } = await sendEmail({
    to: user.email,
    subject: "Reset your password",
    html: await render(ResetPasswordEmail({ name: user.name, resetUrl: url })),
  });
  if (error) {
    throw new APIError("BAD_REQUEST", {
      message: `Error sending reset password email: ${error.message}`,
    });
  }
};

const afterEmailVerification = async (user: User) => {
  await tasks.trigger<typeof welcomeEmailTask>("welcome-email", {
    userId: user.id,
    email: user.email,
    name: user.name,
  });
};

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
    sendResetPassword,
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
  },
  plugins: [nextCookies(), lastLoginMethod()],
});
