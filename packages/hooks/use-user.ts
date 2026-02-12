"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/packages/auth/auth-client";
import { useTRPC } from "@/packages/trpc/client";
import { createClientLoggerWithContext } from "@/packages/utils/client-logger";
import { isValidTimezone } from "../utils/timezone";

const useUserLogger = createClientLoggerWithContext("use-user");

export function useUserQuery() {
  const trpc = useTRPC();
  const { data: session, isPending: sessionIsPending } =
    authClient.useSession();
  const profileQueryOptions = trpc.profile.getProfile.queryOptions();
  const {
    data: profile,
    isPending: profileIsPending,
    isFetching: profileIsFetching,
  } = useQuery({
    ...profileQueryOptions,
    enabled: !!session?.user,
  });

  const ipAddress = session?.session.ipAddress;
  const userAgent = session?.session.userAgent;
  // Track if we've already attempted detection in this session
  const hasAttemptedDetection = useRef(false);
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);

  useEffect(() => {
    if (hasAttemptedDetection.current || !session?.user) {
      return;
    }

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (isValidTimezone(timezone)) {
        setDetectedTimezone(timezone);
      }
    } catch (error) {
      useUserLogger.error("timezone detection failed", { error });
    } finally {
      hasAttemptedDetection.current = true;
    }
  }, [session?.user]);

  return {
    profile,
    session,
    isSignedIn: !!session?.user,
    user: session?.user,
    isPending: profileIsPending || sessionIsPending,
    isFetching: profileIsFetching,
    ipAddress,
    userAgent,
    timezone: detectedTimezone,
  };
}
