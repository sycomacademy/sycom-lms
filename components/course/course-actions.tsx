"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "@/packages/auth/auth-client";
import { useTRPC } from "@/packages/trpc/client";

interface CourseActionsProps {
  courseId: string;
}

export function CourseActions({ courseId }: CourseActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const signInUrl = `/sign-in?callbackUrl=/courses/${courseId}` as Route;

  if (!session) {
    return (
      <Button
        className="w-full"
        nativeButton={false}
        render={<Link href={signInUrl} />}
        size="lg"
      >
        Enroll Now
      </Button>
    );
  }

  return (
    <AuthenticatedActions
      courseId={courseId}
      onEnrolled={() => router.refresh()}
    />
  );
}

function AuthenticatedActions({
  courseId,
  onEnrolled,
}: {
  courseId: string;
  onEnrolled: () => void;
}) {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.course.isEnrolled.queryOptions({ courseId })
  );
  const enrollMutation = useMutation(
    trpc.course.enroll.mutationOptions({
      onSuccess: () => {
        onEnrolled();
      },
    })
  );

  const isEnrolled = data?.enrolled ?? false;

  if (isLoading) {
    return (
      <Button className="w-full" disabled size="lg">
        <Loader2Icon className="size-4 animate-spin" />
      </Button>
    );
  }

  if (isEnrolled) {
    return (
      <Button
        className="w-full"
        nativeButton={false}
        render={<Link href={`/learn/course/${courseId}` as Route} />}
        size="lg"
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
      size="lg"
    >
      {enrollMutation.isPending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : null}
      Enroll Now
    </Button>
  );
}
