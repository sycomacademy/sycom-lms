import { Suspense } from "react";
import { EditCoursePage } from "@/components/dashboard/courses/edit-course-page";
import { instructorGuard } from "@/packages/auth/helper";
import { HydrateClient, prefetch, trpc } from "@/packages/trpc/server";

interface EditCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditCourseRoute({ params }: EditCoursePageProps) {
  await instructorGuard();
  const { courseId } = await params;

  // const course = await (await getCaller()).course.getById({ courseId });
  // if (!course) {
  //   notFound();
  // }

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
