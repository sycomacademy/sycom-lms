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

interface LearnLessonPageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LearnLessonRoute({
  params,
}: LearnLessonPageProps) {
  await dashboardGuard();
  const { courseId, lessonId } = await params;

  await withAuthRedirect(async () => {
    try {
      await (await getCaller()).course.getEnrolledLesson({
        courseId,
        lessonId,
      });
    } catch (error) {
      if (error instanceof TRPCError && error.code === "NOT_FOUND") {
        notFound();
      }
      throw error;
    }
    await prefetch(
      trpc.course.getEnrolledLesson.queryOptions({ courseId, lessonId })
    );
  });

  return (
    <HydrateClient>
      <LearnLessonPage courseId={courseId} lessonId={lessonId} />
    </HydrateClient>
  );
}
