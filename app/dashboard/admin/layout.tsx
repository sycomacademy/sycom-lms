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
      })
    ),
    prefetch(
      trpc.admin.listReports.queryOptions({
        limit: 10,
        offset: 0,
      })
    ),
  ]);

  return (
    <HydrateClient>
      <div className="mb-10 md:ml-12">
        <AdminMenu
          items={[
            { path: "/dashboard/admin", label: "Users" },
            { path: "/dashboard/admin/courses", label: "Courses" },
            { path: "/dashboard/admin/pathways", label: "Pathways" },
            { path: "/dashboard/admin/reports", label: "Reports & Feedback" },
          ]}
        />
        <section className="mt-6">{children}</section>
      </div>
    </HydrateClient>
  );
}
