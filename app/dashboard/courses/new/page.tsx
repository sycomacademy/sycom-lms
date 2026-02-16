import { Suspense } from "react";
import { CreateCourseForm } from "@/components/dashboard/courses/create-course-form";
import { BackButton } from "@/components/layout/back-button";
import { Spinner } from "@/components/ui/spinner";
import { instructorGuard } from "@/packages/auth/helper";

export default async function NewCoursePage() {
  await instructorGuard();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackButton className="px-0" />
        <h1 className="font-semibold text-2xl tracking-tight">Create course</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Add basic info first, then add chapters and lessons on the edit page.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-5" />
          </div>
        }
      >
        <CreateCourseForm />
      </Suspense>
    </div>
  );
}
