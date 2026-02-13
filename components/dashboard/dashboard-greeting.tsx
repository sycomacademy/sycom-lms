"use client";
import { TZDate } from "@date-fns/tz";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserQuery } from "@/packages/hooks/use-user";

function getTimeBasedGreeting(timezone?: string): string {
  const userTimezone =
    timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new TZDate(new Date(), userTimezone);
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return "Morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Afternoon";
  }

  return "Evening";
}

export function DashboardGreeting() {
  const { timezone, user } = useUserQuery();

  const [greeting, setGreeting] = useState(() =>
    getTimeBasedGreeting(timezone ?? undefined)
  );

  useEffect(() => {
    // Update greeting immediately when user timezone changes
    setGreeting(getTimeBasedGreeting(timezone ?? undefined));

    // Set up interval to update greeting every 5 minutes
    // This ensures the greeting changes naturally as time passes
    const interval = setInterval(
      () => {
        const newGreeting = getTimeBasedGreeting(timezone ?? undefined);
        setGreeting(newGreeting);
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [timezone]);

  const displayName = user?.name ?? user?.email?.split("@")[0];

  return (
    <h2 className="font-semibold text-foreground text-lg tracking-tight">
      {greeting},{" "}
      {displayName ?? (
        <Skeleton className="inline-block h-5 w-24 align-middle" />
      )}
    </h2>
  );
}
