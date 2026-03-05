import { TRPCError } from "@trpc/server";
import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { getCaller } from "@/packages/trpc/server";

interface LearnCourseIndexPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function LearnCourseIndexPage({
  params,
}: LearnCourseIndexPageProps) {
  const { courseId } = await params;

  try {
    const data = await (await getCaller()).course.getEnrolledCourse({
      courseId,
    });

    const firstUnlockedLessonId = data.sections
      .flatMap((s) => s.lessons)
      .find((l) => l.isLocked !== true)?.id;

    if (!firstUnlockedLessonId) {
      return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 py-10">
          <h1 className="font-semibold text-2xl tracking-tight">
            {data.course.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            This course doesn&apos;t have any unlocked lessons yet.
          </p>
        </div>
      );
    }

    redirect(`/learn/course/${courseId}/${firstUnlockedLessonId}` as Route);
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }
}
