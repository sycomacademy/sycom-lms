"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/packages/trpc/client";

export function ClientComponent() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.healthCheck.queryOptions());

  if (isLoading) {
    return <p className="text-muted-foreground">Loading health check…</p>;
  }

  return (
    <p className="text-muted-foreground text-sm">
      tRPC health: <span className="font-semibold">{data}</span>
    </p>
  );
}
