import { Suspense } from "react";
import { OrgsTable } from "@/components/dashboard/admin/organizations/orgs-table";
import { Spinner } from "@/components/ui/spinner";
import { adminGuard } from "@/packages/auth/helper";

export default async function AdminOrganizationsPage() {
  await adminGuard();
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Spinner className="size-5" />
        </div>
      }
    >
      <OrgsTable />
    </Suspense>
  );
}
