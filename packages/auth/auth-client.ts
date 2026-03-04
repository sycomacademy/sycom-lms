"use client";

import { passkeyClient } from "@better-auth/passkey/client";
import { ssoClient } from "@better-auth/sso/client";
import {
  adminClient,
  lastLoginMethodClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getWebsiteUrl } from "@/packages/env/utils";
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

export const authClient = createAuthClient({
  baseURL: getWebsiteUrl(),
  plugins: [
    lastLoginMethodClient(),
    passkeyClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        if (typeof window !== "undefined") {
          window.location.href = "/two-factor";
        }
      },
    }),
    adminClient({
      ac: platformAc,
      roles: {
        platform_admin: platformAdmin,
        content_creator: contentCreator,
        platform_student: platformStudent,
      },
    }),
    organizationClient({
      ac: orgAc,
      roles: {
        owner: orgOwner,
        admin: orgAdmin,
        auditor: orgAuditor,
        teacher: orgTeacher,
        student: orgStudent,
      },
    }),
    ssoClient({
      domainVerification: {
        enabled: true,
      },
    }),
  ],
});

export const { useSession } = authClient;
