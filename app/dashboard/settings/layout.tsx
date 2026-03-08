import type { Route } from "next";
import { SecondaryMenu } from "@/components/dashboard/secondary-menu";
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
        base="/dashboard/settings"
        items={[
          { path: "/dashboard/settings" as Route, label: "General" },
          { path: "/dashboard/settings/security" as Route, label: "Security" },
          {
            path: "/dashboard/settings/preferences" as Route,
            label: "Preferences",
          },
        ]}
        label="Settings"
      />
      <section className="mt-6">{children}</section>
    </div>
  );
}
