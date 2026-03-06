import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OrgOverviewClient } from "@/components/dashboard/org-overview-client";
import { Spinner } from "@/components/ui/spinner";
import { getActiveOrgContext } from "@/packages/auth/helper";
import { HydrateClient, prefetch, trpc } from "@/packages/trpc/server";

export default async function OrgOverviewPage() {
  const { slug, memberRole } = await getActiveOrgContext();
  const canManageOrg = memberRole === "org_owner" || memberRole === "org_admin";

  if (!canManageOrg) {
    redirect(`/dashboard/org/${slug}/courses`);
  }

  await Promise.all([
    prefetch(trpc.org.listCohorts.queryOptions()),
    prefetch(trpc.org.listMembers.queryOptions()),
    prefetch(trpc.org.getOrganization.queryOptions()),
  ]);

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
