import { Suspense } from "react";
import { OrgCohortsList } from "@/components/dashboard/org/org-cohorts-list";
import { Spinner } from "@/components/ui/spinner";

export default function OrgCohortsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner className="size-5" />
        </div>
      }
    >
      <OrgCohortsList />
    </Suspense>
  );
}
