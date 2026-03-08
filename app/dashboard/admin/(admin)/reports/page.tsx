import { Suspense } from "react";
import { ReportsTable } from "@/components/dashboard/admin/reports/reports-table";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { adminGuard } from "@/packages/auth/helper";

export default async function ReportsPage() {
  await adminGuard();
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ReportsTable />
    </Suspense>
  );
}
