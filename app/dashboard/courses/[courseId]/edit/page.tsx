import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EditCoursePage } from "@/components/dashboard/courses/edit/edit-course-page";
import { instructorGuard } from "@/packages/auth/helper";
import { getQueryClient, HydrateClient, trpc } from "@/packages/trpc/server";

interface EditCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditCourseRoute({ params }: EditCoursePageProps) {
  await instructorGuard();
  const { courseId } = await params;
  const queryClient = getQueryClient();

  const course = await queryClient.fetchQuery(
    trpc.course.getById.queryOptions({ courseId })
  );

  if (!course) {
    notFound();
  }

  return (
    <HydrateClient>
      <Suspense>
        <EditCoursePage courseId={courseId} />
      </Suspense>
    </HydrateClient>
  );
}
