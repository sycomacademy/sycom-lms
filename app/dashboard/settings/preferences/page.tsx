import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { AccountPreferences } from "@/components/dashboard/settings/account-preferences";
import { dashboardGuard } from "@/packages/auth/helper";

export default async function AccountPreferencesPage() {
  await dashboardGuard();
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <AccountPreferences />
      </Suspense>
    </div>
  );
}
