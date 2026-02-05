"use client";

import { createAuthClient } from "better-auth/react";
import { env } from "../env/client";

export const authClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
