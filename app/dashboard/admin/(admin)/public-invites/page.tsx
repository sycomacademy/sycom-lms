import { Suspense } from "react";
import { PublicInvitesTable } from "@/components/dashboard/admin/public-invites/public-invites-table";
import { Skeleton } from "@/components/ui/skeleton";
import { adminGuard } from "@/packages/auth/helper";

function PublicInvitesPageFallback() {
  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between gap-3">
        <Skeleton className="h-9 max-w-sm flex-1" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export default async function AdminPublicInvitesPage() {
  await adminGuard();

  return (
    <Suspense fallback={<PublicInvitesPageFallback />}>
      <PublicInvitesTable />
    </Suspense>
  );
}
