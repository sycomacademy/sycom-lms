"use client";

import { createAuthClient } from "better-auth/react";
import { getWebsiteUrl } from "../env/util";

export const authClient = createAuthClient({
  baseURL: getWebsiteUrl(),
});

export const { signIn, signUp, signOut, useSession } = authClient;
