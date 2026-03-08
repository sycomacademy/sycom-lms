import { AdminOverview } from "@/components/dashboard/overview/admin-overview";
import { adminGuard } from "@/packages/auth/helper";
import { prefetch, trpc } from "@/packages/trpc/server";

export default async function AdminOverviewPage() {
  await adminGuard();
  await prefetch(trpc.overview.admin.queryOptions());

  return <AdminOverview />;
}
