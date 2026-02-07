"use client";

import { createAuthClient } from "better-auth/react";
import { getWebsiteUrl } from "@/packages/env/client";

export const authClient = createAuthClient({
  baseURL: getWebsiteUrl(),
});

export const { signIn, signUp, signOut, useSession } = authClient;
