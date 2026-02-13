"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";
import type { RouterOutputs } from "@/packages/trpc/server/router";
import type { UpdateAccountInput } from "@/packages/types/profile";
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
    role: user.role,
  };
}

export function useUserMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const profileQueryKey = trpc.profile.getProfile.queryKey();

  return useMutation({
    ...trpc.profile.update.mutationOptions({
      onMutate: async (newData: UpdateAccountInput) => {
        await queryClient.cancelQueries({ queryKey: profileQueryKey });
        const previousData = queryClient.getQueryData(profileQueryKey);
        type ProfileData = RouterOutputs["profile"]["getProfile"];
        queryClient.setQueryData(
          profileQueryKey,
          (old: ProfileData | undefined) => {
            if (!old || typeof old !== "object") {
              return old;
            }
            const prev = old as {
              user?: { name?: string; email?: string };
              profile?: { bio?: string };
            };
            return {
              ...old,
              user:
                newData.name !== undefined || newData.email !== undefined
                  ? { ...prev.user, ...newData }
                  : prev.user,
              profile:
                newData.bio !== undefined
                  ? { ...prev.profile, bio: newData.bio }
                  : prev.profile,
            } as ProfileData;
          }
        );
        return { previousData };
      },
      onError: (_err, _vars, context) => {
        if (context?.previousData !== undefined) {
          queryClient.setQueryData(profileQueryKey, context.previousData);
        }
        toastManager.add({
          title: "Update failed",
          description:
            _err.message ?? "Something went wrong. Please try again.",
          type: "error",
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: profileQueryKey });
      },
    }),
  });
}
