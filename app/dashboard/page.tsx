"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/packages/hooks/use-user";

export default function DashboardPage() {
  const { user, isSignedIn, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isSignedIn, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const name = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-semibold text-2xl tracking-tight">
          Welcome back, {name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s your learning dashboard
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-muted-foreground text-sm">
          Your courses and progress will appear here.
        </p>
      </div>
    </div>
  );
}
