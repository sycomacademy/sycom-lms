import { Suspense } from "react";
import {
  JourneyList,
  JourneyListSkeleton,
} from "@/components/dashboard/journey/journey-list";
import { dashboardGuard } from "@/packages/auth/helper";
import { HydrateClient, prefetch, trpc } from "@/packages/trpc/server";

export default async function DashboardJourneyPage() {
  await dashboardGuard();
  await prefetch(trpc.enrollment.listMy.queryOptions());

  return (
    <HydrateClient>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">My Journey</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Track every enrolled course, revisit completed lessons, and jump
            back into the next module waiting for you.
          </p>
        </div>

        <Suspense fallback={<JourneyListSkeleton />}>
          <JourneyList />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
