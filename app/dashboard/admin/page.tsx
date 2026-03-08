import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { adminGuard } from "@/packages/auth/helper";

export default async function AdminOverviewPage() {
  await adminGuard();
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner className="size-5" />
        </div>
      }
    >
      {/* <AdminOverviewClient /> */}
    </Suspense>
  );
}
