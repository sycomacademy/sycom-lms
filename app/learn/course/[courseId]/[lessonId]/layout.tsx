import { prefetch, trpc } from "@/packages/trpc/server";

export default async function LearnLessonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  await prefetch(
    trpc.course.getEnrolledLesson.queryOptions({ courseId, lessonId })
  );

  return children;
}
