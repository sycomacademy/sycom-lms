"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";
import type { UpdateAccountInput } from "@/packages/utils/schema";
import { createLoggerWithContext } from "../utils/logger";
import { isValidTimezone } from "../utils/time";

const useUserLogger = createLoggerWithContext("client:use-user");

export function useUserQuery() {
  const trpc = useTRPC();

  const profileQueryOptions = trpc.user.me.queryOptions();
  const {
    data: userData,
    isPending: profileIsPending,
    isFetching: profileIsFetching,
    error: userError,
  } = useSuspenseQuery({
    ...profileQueryOptions,
  });

  const profile = userData.profile;
  const session = userData.session;
  const user = userData.user;

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

  if (userError) {
    return {
      isSignedIn: false,
      user: null,
      profile: null,
    };
  }

  return {
    profile,
    session,
    isSignedIn: !!user,
    user,
    isPending: profileIsPending,
    isFetching: profileIsFetching,
    timezone: detectedTimezone,
  };
}

export function useUserMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const profileQueryKey = trpc.user.me.queryKey();

  return useMutation({
    ...trpc.user.update.mutationOptions({
      onMutate: async (newData: UpdateAccountInput) => {
        await queryClient.cancelQueries({ queryKey: profileQueryKey });
        const previousData = queryClient.getQueryData(profileQueryKey);
        type ProfileData = RouterOutputs["user"]["me"];
        queryClient.setQueryData(
          profileQueryKey,
          (old: ProfileData | undefined) => {
            if (!old || typeof old !== "object") {
              return old;
            }
            return {
              ...old,
              user:
                newData.name !== undefined || newData.email !== undefined
                  ? { ...old.user, ...newData }
                  : old.user,
              profile:
                newData.bio !== undefined || newData.settings !== undefined
                  ? {
                      ...old.profile,
                      ...(newData.bio !== undefined && { bio: newData.bio }),
                      ...(newData.settings !== undefined && {
                        settings: {
                          ...old.profile?.settings,
                          ...newData.settings,
                        },
                      }),
                    }
                  : old.profile,
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
