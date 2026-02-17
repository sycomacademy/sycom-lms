import { Suspense } from "react";
import { LearnLessonPage } from "@/components/learn/learn-lesson-page";
import { Spinner } from "@/components/ui/spinner";

interface LearnLessonPageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LearnLessonRoute({
  params,
}: LearnLessonPageProps) {
  const { courseId, lessonId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Spinner className="size-5" />
        </div>
      }
    >
      <LearnLessonPage courseId={courseId} lessonId={lessonId} />
    </Suspense>
  );
}
