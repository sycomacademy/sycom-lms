import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { AccountGeneral } from "@/components/dashboard/settings/account-general";
import { dashboardGuard } from "@/packages/auth/helper";

export default async function DashboardAccountPage() {
  await dashboardGuard();
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <AccountGeneral />
      </Suspense>
    </div>
  );
}
