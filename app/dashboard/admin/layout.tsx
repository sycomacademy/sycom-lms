import { AdminMenu } from "@/components/dashboard/admin/admin-menu";
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
      <div className="mx-auto max-w-7xl px-4 py-6">
        <AdminMenu
          items={[
            { path: "/dashboard/admin", label: "Overview" },
            { path: "/dashboard/admin/users", label: "Users" },
            { path: "/dashboard/admin/organizations", label: "Organizations" },
            { path: "/dashboard/admin/reports", label: "Reports & Feedback" },
          ]}
        />
        <section className="mt-6">{children}</section>
      </div>
    </HydrateClient>
  );
}
