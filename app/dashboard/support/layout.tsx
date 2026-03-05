import { SupportMenu } from "@/components/dashboard/support/support-menu";
import { dashboardGuard } from "@/packages/auth/helper";

export default async function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await dashboardGuard();

  return (
    <div className="mb-10 max-w-3xl md:ml-12">
      <SupportMenu
        items={[
          { path: "/dashboard/support", label: "Report" },
          { path: "/dashboard/support/faq", label: "FAQ" },
          { path: "/dashboard/support/contact", label: "Contact Us" },
        ]}
      />
      <section className="mt-6">{children}</section>
    </div>
  );
}
