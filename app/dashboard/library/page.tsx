import { Suspense } from "react";
import { LibraryList } from "@/components/dashboard/library/library-list";
import { Spinner } from "@/components/ui/spinner";
import { dashboardGuard } from "@/packages/auth/helper";

export default async function DashboardLibraryPage() {
  await dashboardGuard();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Library</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Browse and enroll in published courses.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-5" />
          </div>
        }
      >
        <LibraryList />
      </Suspense>
    </div>
  );
}
