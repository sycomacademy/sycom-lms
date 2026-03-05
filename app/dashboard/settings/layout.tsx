import type { Route } from "next";
import { SecondaryMenu } from "@/components/dashboard/settings/settings-menu";
import { dashboardGuard } from "@/packages/auth/helper";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await dashboardGuard();
  return (
    <div className="mb-10 max-w-3xl md:ml-12">
      <SecondaryMenu
        items={[
          { path: "/dashboard/settings" as Route, label: "General" },
          { path: "/dashboard/settings/security" as Route, label: "Security" },
          {
            path: "/dashboard/settings/preferences" as Route,
            label: "Preferences",
          },
        ]}
      />
      <section className="mt-6">{children}</section>
    </div>
  );
}
