import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { AccountSecurity } from "@/components/dashboard/settings/account-security";
import { dashboardGuard } from "@/packages/auth/helper";

export default async function AccountSecurityPage() {
  await dashboardGuard();
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <AccountSecurity />
      </Suspense>
    </div>
  );
}
