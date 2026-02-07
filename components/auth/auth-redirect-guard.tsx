"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/packages/auth/auth-client";

export function AuthRedirectGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) {
      return;
    }
    if (session) {
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (session) {
    return null;
  }

  return <>{children}</>;
}
