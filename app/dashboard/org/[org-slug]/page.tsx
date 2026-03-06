import { Suspense } from "react";
import { OrgOverviewClient } from "@/components/dashboard/org-overview-client";
import { Spinner } from "@/components/ui/spinner";
import { orgGuardWithSlug } from "@/packages/auth/helper";
import { HydrateClient, prefetch, trpc } from "@/packages/trpc/server";

export default async function OrgOverviewPage() {
  await orgGuardWithSlug();

  await prefetch(trpc.org.listCohorts.queryOptions());
  await prefetch(trpc.org.listMembers.queryOptions());
  await prefetch(trpc.org.getOrganization.queryOptions());

  return (
    <HydrateClient>
      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Spinner className="size-5" />
          </div>
        }
      >
        <OrgOverviewClient />
      </Suspense>
    </HydrateClient>
  );
}
