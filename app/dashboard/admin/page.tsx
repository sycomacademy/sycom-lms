import { Suspense } from "react";
import { AdminOverviewClient } from "@/components/dashboard/admin-overview-client";
import { Spinner } from "@/components/ui/spinner";

export default async function AdminOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner className="size-5" />
        </div>
      }
    >
      <AdminOverviewClient />
    </Suspense>
  );
}
