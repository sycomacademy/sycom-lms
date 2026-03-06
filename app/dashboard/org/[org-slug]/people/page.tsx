import { Suspense } from "react";
import { OrgPeopleTable } from "@/components/dashboard/org/org-people-table";
import { Spinner } from "@/components/ui/spinner";

export default function OrgPeoplePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner className="size-5" />
        </div>
      }
    >
      <OrgPeopleTable />
    </Suspense>
  );
}
