import { Suspense } from "react";
import { CoursesTable } from "@/components/dashboard/courses/courses-table";
import { Spinner } from "@/components/ui/spinner";

export default function CoursesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Courses</h1>
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
        <CoursesTable />
      </Suspense>
    </div>
  );
}
