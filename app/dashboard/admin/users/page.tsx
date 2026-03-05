import { Suspense } from "react";
import { UsersTable } from "@/components/dashboard/admin/users/users-table";
import { Spinner } from "@/components/ui/spinner";
import { adminGuard } from "@/packages/auth/helper";

export default async function AdminUsersPage() {
  await adminGuard();
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-5" />
        </div>
      }
    >
      <UsersTable />
    </Suspense>
  );
}
