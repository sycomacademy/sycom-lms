"use client";

import { passkeyClient } from "@better-auth/passkey/client";
import {
  adminClient,
  lastLoginMethodClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, admin, instructor, student } from "@/packages/auth/permissions";
import { getWebsiteUrl } from "@/packages/env/utils";

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
      ac,
      roles: {
        admin,
        instructor,
        student,
      },
    }),
  ],
});

export const { useSession } = authClient;
