import { AdminMenu } from "@/components/dashboard/admin/admin-menu";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <AdminMenu
        items={[
          { path: "/dashboard/admin/users", label: "Users" },
          { path: "/dashboard/admin/organizations", label: "Organizations" },
          { path: "/dashboard/admin/reports", label: "Reports & Feedback" },
        ]}
      />
      <section className="mt-6">{children}</section>
    </div>
  );
}
