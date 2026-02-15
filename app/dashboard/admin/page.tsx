import { Suspense } from "react";
import { UsersTable } from "@/components/dashboard/admin/users/users-table";
import { Spinner } from "@/components/ui/spinner";

export default function AdminPage() {
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
