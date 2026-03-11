"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import type { Route } from "next";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";
import { useSession } from "@/packages/auth/auth-client";
import { useTRPC } from "@/packages/trpc/client";

interface CourseActionsProps {
  courseId: string;
}

export function CourseActions({ courseId }: CourseActionsProps) {
  const { data: session, isPending: sessionLoading } = useSession();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: enrollmentData, isPending: statusLoading } = useQuery({
    ...trpc.enrollment.status.queryOptions({ courseId }),
    enabled: !!session?.user,
  });

  const enrollMutation = useMutation(
    trpc.enrollment.enrollPublic.mutationOptions({
      onSuccess: () => {
        toastManager.add({ title: "Enrolled successfully", type: "success" });
        queryClient.invalidateQueries({
          queryKey: trpc.enrollment.status.queryKey({ courseId }),
        });
      },
      onError: (error) => {
        if (
          error.message ===
          "Accounts with public email domains are not allowed to enroll in courses"
        ) {
          toastManager.add({
            title: "Enrollment failed",
            description:
              "Accounts with public email domains are not allowed to enroll in courses. Create a new account with an organization email domain to enroll.",
            type: "error",
          });
        } else {
          toastManager.add({
            title: "Enrollment failed",
            description: error.message,
            type: "error",
          });
        }
      },
    })
  );

  if (sessionLoading) {
    return (
      <Button className="w-full" disabled>
        <Loader2Icon className="size-4 animate-spin" />
      </Button>
    );
  }

  if (!session?.user) {
    return (
      <Button
        className="w-full"
        nativeButton={false}
        render={<Link href={"/sign-in" as Route} />}
      >
        Sign in to enroll
      </Button>
    );
  }

  if (statusLoading) {
    return (
      <Button className="w-full" disabled>
        <Loader2Icon className="size-4 animate-spin" />
      </Button>
    );
  }

  if (enrollmentData?.isEnrolled) {
    return (
      <Button
        className="w-full"
        nativeButton={false}
        render={<Link href={`/learn/${courseId}` as Route} />}
      >
        Continue Learning
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      disabled={enrollMutation.isPending}
      onClick={() => enrollMutation.mutate({ courseId })}
    >
      {enrollMutation.isPending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        "Enroll in course"
      )}
    </Button>
  );
}
