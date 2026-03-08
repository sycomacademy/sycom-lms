import { Suspense } from "react";
import { UsersTable } from "@/components/dashboard/admin/users/users-table";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { adminGuard } from "@/packages/auth/helper";

export default async function AdminUsersPage() {
  await adminGuard();
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <UsersTable />
    </Suspense>
  );
}
