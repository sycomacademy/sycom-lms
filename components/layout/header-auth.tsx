"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/packages/auth/auth-client";

export function HeaderAuth() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <Skeleton className="h-10 w-24" />;
  }

  if (!session) {
    return (
      <Button
        nativeButton={false}
        render={<Link href="/sign-in">Sign in</Link>}
        variant="outline"
      />
    );
  }

  return (
    <Button
      nativeButton={false}
      render={<Link href="/">Go to Dashboard</Link>}
      variant="outline"
    />
  );
}
