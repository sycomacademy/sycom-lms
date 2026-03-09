import type { Route } from "next";
import { SecondaryMenu } from "@/components/dashboard/secondary-menu";
import { dashboardGuard } from "@/packages/auth/helper";

export default async function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await dashboardGuard();

  return (
    <div className="mb-10 max-w-3xl md:ml-12">
      <SecondaryMenu
        base="/dashboard/support"
        items={[
          { path: "/dashboard/support" as Route, label: "Report" },
          { path: "/dashboard/support/faq" as Route, label: "FAQ" },
          { path: "/dashboard/support/contact" as Route, label: "Contact Us" },
        ]}
        label="Support"
      />
      <section className="mt-6">{children}</section>
    </div>
  );
}
