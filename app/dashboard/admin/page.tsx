import { Suspense } from "react";
import { AdminOverviewClient } from "@/components/dashboard/admin-overview-client";
import { Spinner } from "@/components/ui/spinner";
import { prefetch, trpc } from "@/packages/trpc/server";

export default async function AdminOverviewPage() {
  await prefetch(
    trpc.admin.listReports.queryOptions({
      limit: 5,
      offset: 0,
      type: "report",
      status: "pending",
    })
  );

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
