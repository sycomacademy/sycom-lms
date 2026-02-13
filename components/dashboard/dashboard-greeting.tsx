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
  const { profile, timezone, user } = useUserQuery();

  const useDeviceTimezone = profile?.settings?.useDeviceTimezone ?? true;
  const useTimeBasedGreeting = useDeviceTimezone === true;

  const [greeting, setGreeting] = useState(() =>
    useTimeBasedGreeting
      ? getTimeBasedGreeting(timezone ?? undefined)
      : "Welcome"
  );

  useEffect(() => {
    if (!useTimeBasedGreeting) {
      setGreeting("Welcome");
      return;
    }
    setGreeting(getTimeBasedGreeting(timezone ?? undefined));
    const interval = setInterval(
      () => setGreeting(getTimeBasedGreeting(timezone ?? undefined)),
      5 * 60 * 1000
    );
    return () => clearInterval(interval);
  }, [timezone, useTimeBasedGreeting]);

  const displayName = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0];

  return (
    <h2 className="font-semibold text-foreground text-lg tracking-tight">
      {greeting},{" "}
      {displayName ?? (
        <Skeleton className="inline-block h-5 w-24 align-middle" />
      )}
    </h2>
  );
}
