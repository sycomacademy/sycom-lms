import { Suspense } from "react";
import {
  UsersTable,
  UsersTableSkeleton,
} from "@/components/dashboard/admin/users/users-table";
import { Skeleton } from "@/components/ui/skeleton";
import { adminGuard } from "@/packages/auth/helper";

function UsersPageFallback() {
  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between gap-3">
        <Skeleton className="h-9 max-w-sm flex-1" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-40" />
      </div>
      <UsersTableSkeleton />
    </div>
  );
}

export default async function AdminUsersPage() {
  await adminGuard();
  return (
    <Suspense fallback={<UsersPageFallback />}>
      <UsersTable />
    </Suspense>
  );
}
