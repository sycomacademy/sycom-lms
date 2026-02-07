"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { trpc } from "@/packages/trpc/client";

interface LessonNavigationProps {
  lessonId: string;
  courseSlug: string;
  isCompleted: boolean;
  canComplete: boolean;
  navigation: {
    prev: { lessonId: string; title: string } | null;
    next: { lessonId: string; title: string } | null;
  };
}

export function LessonNavigation({
  lessonId,
  courseSlug,
  isCompleted,
  canComplete,
  navigation,
}: LessonNavigationProps) {
  const [justCompleted, setJustCompleted] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const markCompleteMutation = useMutation({
    ...trpc.lesson.markComplete.mutationOptions(),
    onSuccess: () => {
      setJustCompleted(true);
      queryClient.invalidateQueries();
      // Navigate to next lesson if available
      if (navigation.next) {
        router.push(`/courses/${courseSlug}/learn/${navigation.next.lessonId}`);
      }
    },
  });

  const handleMarkComplete = useCallback(() => {
    markCompleteMutation.mutate({ lessonId });
  }, [markCompleteMutation, lessonId]);

  const completed = isCompleted || justCompleted;

  return (
    <footer className="flex h-16 shrink-0 items-center justify-between border-t px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        {navigation.prev ? (
          <Button
            nativeButton={false}
            render={
              <Link
                href={`/courses/${courseSlug}/learn/${navigation.prev.lessonId}`}
              />
            }
            size="sm"
            variant="outline"
          >
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
        ) : (
          <Button disabled size="sm" variant="outline">
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!completed && (
          <Button
            disabled={!canComplete || markCompleteMutation.isPending}
            onClick={handleMarkComplete}
            size="sm"
          >
            {markCompleteMutation.isPending ? (
              "Completing..."
            ) : (
              <>
                <CheckIcon className="size-4" />
                Mark Complete
              </>
            )}
          </Button>
        )}

        {completed && !navigation.next && (
          <Button disabled size="sm" variant="outline">
            <CheckIcon className="size-4" />
            Completed
          </Button>
        )}

        {navigation.next ? (
          <Button
            nativeButton={false}
            render={
              <Link
                href={`/courses/${courseSlug}/learn/${navigation.next.lessonId}`}
              />
            }
            size="sm"
            variant={completed ? "default" : "outline"}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRightIcon className="size-4" />
          </Button>
        ) : (
          <Button
            nativeButton={false}
            render={<Link href={`/courses/${courseSlug}`} />}
            size="sm"
            variant="outline"
          >
            Back to Course
          </Button>
        )}
      </div>
    </footer>
  );
}
