/** biome-ignore-all lint/complexity/noVoid: we don't want to await these functions. see https://www.better-auth.com/docs/concepts/email#1-during-sign-up */

import { dash } from "@better-auth/infra";
import { APIError, betterAuth, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  admin as adminPlugin,
  lastLoginMethod,
  organization,
} from "better-auth/plugins";
import { db } from "@/packages/db";
import type { UserRole } from "@/packages/db/helper";
import { schema } from "@/packages/db/schema";
import { render } from "@/packages/email/render";
import { sendEmail } from "@/packages/email/resend";
import { ResetPasswordEmail } from "@/packages/email/templates/reset-password";
import { VerifyEmail } from "@/packages/email/templates/verify-email";
import { env } from "@/packages/env/server";
import { getWebsiteUrl } from "@/packages/env/utils";
import { welcomeEmailTask } from "@/packages/trigger/tasks/welcome-email";
import { triggerJob } from "@/packages/trigger/trigger-job";
import {
  contentCreator,
  orgAc,
  orgAdmin,
  orgAuditor,
  orgOwner,
  orgStudent,
  orgTeacher,
  platformAc,
  platformAdmin,
  student,
} from "./permissions";

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
  triggerJob({
    task: welcomeEmailTask,
    payload: {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
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
  plugins: [
    dash(),
    nextCookies(),
    lastLoginMethod(),
    adminPlugin({
      ac: platformAc,
      roles: {
        platform_admin: platformAdmin,
        content_creator: contentCreator,
        student,
      },
      defaultRole: "student",
    }),
    organization({
      ac: orgAc,
      roles: {
        owner: orgOwner,
        admin: orgAdmin,
        auditor: orgAuditor,
        teacher: orgTeacher,
        student: orgStudent,
      },
      teams: {
        enabled: true,
      },
      schema: {
        team: {
          modelName: "cohort",
        },
      },
      allowUserToCreateOrganization: async (user) => {
        // Only platform admins can create organizations
        const role = user.role as UserRole;
        return role === "platform_admin";
      },
      sendInvitationEmail: async (data) => {
        const inviteLink = `${baseURL}/invite/${data.id}`;
        await sendEmail({
          to: data.email,
          subject: `You've been invited to join ${data.organization.name}`,
          html: `<p>You've been invited to join <strong>${data.organization.name}</strong> by ${data.inviter.user.name}.</p><p><a href="${inviteLink}">Accept invitation</a></p>`,
        });
      },
    }),
  ],
});
