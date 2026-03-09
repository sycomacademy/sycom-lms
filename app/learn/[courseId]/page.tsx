import { notFound } from "next/navigation";
import { LearnLessonPage } from "@/components/learn/learn-lesson-page";
import { dashboardGuard } from "@/packages/auth/helper";
import { getQueryClient, HydrateClient, trpc } from "@/packages/trpc/server";

interface Props {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function LearnCoursePage({ params, searchParams }: Props) {
  await dashboardGuard();
  const queryClient = getQueryClient();
  const { courseId } = await params;
  const { lesson: lessonId } = await searchParams;

  const enrolledCourse = await queryClient.fetchQuery(
    trpc.enrollment.getEnrolledCourse.queryOptions({ courseId })
  );

  if (!enrolledCourse) {
    notFound();
  }

  if (lessonId) {
    const enrolledLesson = await queryClient.fetchQuery(
      trpc.enrollment.getEnrolledLesson.queryOptions({ courseId, lessonId })
    );
    if (!enrolledLesson) {
      notFound();
    }
  }

  return (
    <HydrateClient>
      <LearnLessonPage courseId={courseId} />
    </HydrateClient>
  );
}
