import { Suspense } from "react";
import { CoursesList } from "@/components/dashboard/courses/courses-list";
import { Spinner } from "@/components/ui/spinner";
import { instructorGuard } from "@/packages/auth/helper";

export default async function CoursesPage() {
  const session = await instructorGuard();
  const isAdmin = session.user.role === "admin";
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">
          {isAdmin ? "Courses" : "My courses"}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Create and manage your courses, sections, and lessons.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-5" />
          </div>
        }
      >
        <CoursesList />
      </Suspense>
    </div>
  );
}
