import { adminGuard } from "@/packages/auth/helper";
import { HydrateClient, prefetch, trpc } from "@/packages/trpc/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await adminGuard();

  await Promise.all([
    prefetch(
      trpc.admin.listUsers.queryOptions({
        limit: 10,
        offset: 0,
        sortBy: "createdAt",
        sortDirection: "desc",
      })
    ),
    prefetch(
      trpc.admin.listOrganizations.queryOptions({
        limit: 10,
        offset: 0,
      })
    ),
    prefetch(
      trpc.admin.listReports.queryOptions({
        limit: 10,
        offset: 0,
        type: "all",
        status: "all",
      })
    ),
  ]);

  return (
    <HydrateClient>
      <section className="m-6">{children}</section>
    </HydrateClient>
  );
}
