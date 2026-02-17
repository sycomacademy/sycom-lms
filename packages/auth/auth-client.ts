"use client";

import { adminClient, lastLoginMethodClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, admin, instructor, student } from "@/packages/auth/permissions";
import { getWebsiteUrl } from "@/packages/env/utils";

export const authClient = createAuthClient({
  baseURL: getWebsiteUrl(),
  plugins: [
    lastLoginMethodClient(),
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
