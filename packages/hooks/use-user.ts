"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/packages/auth/auth-client";
import { trpc } from "@/packages/trpc/client";

export function useUser() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const isSignedIn = !!session;

  const {
    data: meData,
    isLoading: isMeLoading,
    refetch,
  } = useQuery({
    ...trpc.auth.me.queryOptions(),
    enabled: isSignedIn,
  });

  const user = meData?.user ?? session?.user ?? null;
  const profile = meData?.profile ?? null;
  const isLoading = isSessionLoading || (isSignedIn && isMeLoading);

  return {
    user,
    profile,
    session,
    isSignedIn,
    isLoading,
    refetch,
  };
}
