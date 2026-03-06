import { scim } from "@better-auth/scim";
import { sso } from "@better-auth/sso";
import { APIError, type User } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import type { UserRole } from "@/packages/db/schema/auth";
import { render } from "@/packages/email/render";
import { sendEmail } from "@/packages/email/resend";
import { InvitationEmail } from "@/packages/email/templates/invitation-email";
import { ResetPasswordEmail } from "@/packages/email/templates/reset-password";
import { VerifyEmail } from "@/packages/email/templates/verify-email";
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
  platformStudent,
} from "./permissions";

export const baseURL = getWebsiteUrl();

export const sendVerificationEmail = async ({
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

export const sendResetPassword = async ({
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

export const afterEmailVerification = async (user: User) => {
  triggerJob({
    task: welcomeEmailTask,
    payload: {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
  });
};

export const adminPlugin = admin({
  ac: platformAc,
  roles: {
    platform_admin: platformAdmin,
    content_creator: contentCreator,
    platform_student: platformStudent,
  },
  defaultRole: "platform_student",
});

export const organizationPlugin = organization({
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
    teamMember: {
      modelName: "cohort_member",
    },
  },
  allowUserToCreateOrganization: async (user) => {
    const role = user.role as UserRole;
    return role === "platform_admin";
  },
  sendInvitationEmail: async (data) => {
    const inviteUrl = `${baseURL}/invite/${data.id}`;
    const roleName = data.role ?? "member";

    const { error } = await sendEmail({
      to: data.email,
      subject: `You've been invited to join ${data.organization.name}`,
      html: await render(
        InvitationEmail({
          organizationName: data.organization.name,
          inviterName: data.inviter.user.name,
          inviteUrl,
          role: roleName,
        })
      ),
    });

    if (error) {
      throw new APIError("BAD_REQUEST", {
        message: `Error sending invitation email: ${error.message}`,
      });
    }
  },
});

export const ssoPlugin = sso({
  // organizationProvisioning: {
  //   disabled: false,
  //   defaultRole: "member" as const,
  //   getRole: async ({ userInfo }) => {
  //     const idpRole = userInfo?.attributes?.role as string | undefined;
  //     if (idpRole === "admin") {
  //       return "admin";
  //     }
  //     const customRoleMap: Record<string, string> = {
  //       teacher: "teacher",
  //       auditor: "auditor",
  //       student: "student",
  //     };
  //     return (customRoleMap[idpRole ?? ""] ?? "student") as "member";
  //   },
  // },
  domainVerification: {
    enabled: true,
  },
  saml: {
    requireTimestamps: true,
  },
});

export const scimPlugin = scim({
  providerOwnership: { enabled: true },
  storeSCIMToken: "hashed",
  // beforeSCIMTokenGenerated: async ({ user, member: orgMember }) => {
  //   const userWithRole = user as typeof user & { role?: string };
  //   const isPlatformAdmin = userWithRole.role === "platform_admin";
  //   const isOrgAdmin =
  //     orgMember?.role === "owner" || orgMember?.role === "admin";
  //   if (!(isPlatformAdmin || isOrgAdmin)) {
  //     throw new APIError("FORBIDDEN", {
  //       message: "Only platform admins or org admins can generate SCIM tokens",
  //     });
  //   }
  // },
});
