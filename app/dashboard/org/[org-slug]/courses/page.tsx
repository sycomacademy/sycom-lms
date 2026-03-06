import { Suspense } from "react";
import { OrgCoursesList } from "@/components/dashboard/org/org-courses-list";
import { Spinner } from "@/components/ui/spinner";

export default function OrgCoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner className="size-5" />
        </div>
      }
    >
      <OrgCoursesList />
    </Suspense>
  );
}
