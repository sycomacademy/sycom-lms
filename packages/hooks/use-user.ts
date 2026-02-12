"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { authClient } from "@/packages/auth/auth-client";
import { useTRPC } from "@/packages/trpc/client";

export function useUserQuery() {
  const trpc = useTRPC();
  const { data: session, isPending: sessionIsPending } =
    authClient.useSession();
  const { data: profile, isPending: profileIsPending } = useSuspenseQuery(
    trpc.profile.getProfile.queryOptions()
  );
  return {
    profile,
    session,
    isSignedIn: !!session?.user,
    user: session?.user,
    isPending: profileIsPending || sessionIsPending,
  };
}
