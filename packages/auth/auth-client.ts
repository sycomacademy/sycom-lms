"use client";

import { lastLoginMethodClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { getWebsiteUrl } from "@/packages/env/utils";

export const authClient = createAuthClient({
  baseURL: getWebsiteUrl(),
  plugins: [lastLoginMethodClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
