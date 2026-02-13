"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTRPC } from "@/packages/trpc/client";
import { createLoggerWithContext } from "../utils/logger";
import { isValidTimezone } from "../utils/time";

const useUserLogger = createLoggerWithContext("client:use-user");

export function useUserQuery() {
  const trpc = useTRPC();

  const profileQueryOptions = trpc.profile.getProfile.queryOptions();
  const {
    data: userData,
    isPending: profileIsPending,
    isFetching: profileIsFetching,
  } = useSuspenseQuery({
    ...profileQueryOptions,
  });

  const profile = userData.profile;
  const session = userData.session;
  const user = userData.user;

  // Track if we've already attempted detection in this session
  const hasAttemptedDetection = useRef(false);
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);

  useEffect(() => {
    if (hasAttemptedDetection.current || !user) {
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
  }, [user]);

  return {
    profile,
    session,
    isSignedIn: !!user,
    user,
    isPending: profileIsPending,
    isFetching: profileIsFetching,
    timezone: detectedTimezone,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
  };
}
