import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { LearnLessonPage } from "@/components/learn/learn-lesson-page";
import { dashboardGuard, withAuthRedirect } from "@/packages/auth/helper";
import {
  getCaller,
  HydrateClient,
  prefetch,
  trpc,
} from "@/packages/trpc/server";

interface Props {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function LearnCoursePage({ params, searchParams }: Props) {
  await dashboardGuard();
  const { courseId } = await params;
  const { lesson: lessonId } = await searchParams;

  try {
    await withAuthRedirect(async () => {
      const caller = await getCaller();
      await caller.enrollment.getEnrolledCourse({ courseId });
      await prefetch(
        trpc.enrollment.getEnrolledCourse.queryOptions({ courseId })
      );
      if (lessonId) {
        await prefetch(
          trpc.enrollment.getEnrolledLesson.queryOptions({ courseId, lessonId })
        );
      }
    });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }
    if (
      error instanceof TRPCError &&
      (error.code === "FORBIDDEN" || error.code === "BAD_REQUEST")
    ) {
      notFound();
    }
    throw error;
  }

  return (
    <HydrateClient>
      <LearnLessonPage courseId={courseId} />
    </HydrateClient>
  );
}
