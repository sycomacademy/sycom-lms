"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/packages/trpc/client";

export function useUserQuery() {
  const trpc = useTRPC();
  // Use useQuery (not suspense) so consumers outside Suspense boundaries
  // do not blank the page while hydrating.
  const result = useQuery({
    ...trpc.user.me.queryOptions(),
    refetchInterval: 6 * 60 * 60 * 1000,
  });

  return result as typeof result & { data: NonNullable<typeof result.data> };
}
