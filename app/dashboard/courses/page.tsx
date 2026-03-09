import { Suspense } from "react";
import { CoursesList } from "@/components/dashboard/courses/courses-list";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { instructorGuard } from "@/packages/auth/helper";

export default async function DashboardCoursesPage() {
  await instructorGuard();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Courses</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Create and manage your courses, sections, and lessons.
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <CoursesList />
      </Suspense>
    </div>
  );
}
