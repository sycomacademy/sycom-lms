import { Suspense } from "react";
import { CreateCourseForm } from "@/components/dashboard/courses/create-course-form";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { BackButton } from "@/components/layout/back-button";
import { instructorGuard } from "@/packages/auth/helper";

export default async function NewCoursePage() {
  await instructorGuard();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackButton className="px-0" />
        <h1 className="font-semibold text-2xl tracking-tight">
          Create new course
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Add a new course to the platform. You can edit the curriculum after
          creation.
        </p>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <CreateCourseForm />
      </Suspense>
    </div>
  );
}
