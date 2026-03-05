import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EditCoursePage } from "@/components/dashboard/courses/edit-course-page";
import { instructorGuard } from "@/packages/auth/helper";
import {
  getCaller,
  HydrateClient,
  prefetch,
  trpc,
} from "@/packages/trpc/server";

interface EditCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditCourseRoute({ params }: EditCoursePageProps) {
  await instructorGuard();
  const { courseId } = await params;

  try {
    await (await getCaller()).course.getById({ courseId });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  await Promise.all([
    prefetch(trpc.course.getById.queryOptions({ courseId })),
    prefetch(trpc.category.list.queryOptions()),
  ]);

  return (
    <HydrateClient>
      <Suspense>
        <EditCoursePage courseId={courseId} />
      </Suspense>
    </HydrateClient>
  );
}
