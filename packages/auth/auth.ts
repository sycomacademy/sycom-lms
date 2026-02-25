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
import { getWebsiteUrl } from "../env/utils";

const baseURL = getWebsiteUrl();

const socialProviders = {};

const sendVerificationEmail = async ({
  user,
  url,
}: {
  user: User;
  url: string;
}) => {
  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your email",
      html: await render(VerifyEmail({ name: user.name, verifyUrl: url })),
    });
  } catch (error) {
    throw new APIError("BAD_REQUEST", {
      message: `Error sending verification email: ${error instanceof Error ? error.message : "Unknown error"}`,
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
  try {
    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: await render(
        ResetPasswordEmail({ name: user.name, resetUrl: url })
      ),
    });
  } catch (error) {
    throw new APIError("BAD_REQUEST", {
      message: `Error sending reset password email: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
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
    sendResetPassword,
    revokeSessionsOnPasswordReset: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail,
  },
  socialProviders,
  plugins: [nextCookies(), lastLoginMethod()],
});
