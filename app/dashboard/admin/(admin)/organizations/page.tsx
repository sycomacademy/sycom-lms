import { Suspense } from "react";
import { OrgsTable } from "@/components/dashboard/admin/organizations/orgs-table";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { adminGuard } from "@/packages/auth/helper";

export default async function AdminOrganizationsPage() {
  await adminGuard();
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <OrgsTable />
    </Suspense>
  );
}
