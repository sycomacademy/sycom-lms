import { Suspense } from "react";
import { EnrollmentsTable } from "@/components/dashboard/admin/enrollments/enrollments-table";
import { Skeleton } from "@/components/ui/skeleton";
import { adminGuard } from "@/packages/auth/helper";

function EnrollmentsPageFallback() {
  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between gap-3">
        <Skeleton className="h-9 max-w-sm flex-1" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export default async function AdminEnrollmentsPage() {
  await adminGuard();

  return (
    <Suspense fallback={<EnrollmentsPageFallback />}>
      <EnrollmentsTable />
    </Suspense>
  );
}
