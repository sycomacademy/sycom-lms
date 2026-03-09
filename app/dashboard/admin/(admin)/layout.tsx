import type { Route } from "next";
import { SecondaryMenu } from "@/components/dashboard/secondary-menu";
import { adminGuard } from "@/packages/auth/helper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await adminGuard();
  return (
    <div className="mb-10 md:ml-12">
      <SecondaryMenu
        base="/dashboard/admin/users"
        items={[
          { path: "/dashboard/admin/users", label: "Users" },
          {
            path: "/dashboard/admin/public-invites" as Route,
            label: "Public Invites",
          },
          {
            path: "/dashboard/admin/enrollments" as Route,
            label: "Enrollments",
          },
          { path: "/dashboard/admin/organizations", label: "Organizations" },

          { path: "/dashboard/admin/reports", label: "Reports & Feedback" },
        ]}
        label="Admin"
      />
      <section className="mt-6">{children}</section>
    </div>
  );
}
