import { SecondaryMenu } from "@/components/dashboard/settings/secondary-menu";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <SecondaryMenu
        items={[
          { path: "/dashboard/settings", label: "General" },
          { path: "/dashboard/settings/security", label: "Security" },
          { path: "/dashboard/settings/preferences", label: "Preferences" },
        ]}
      />
      <main className="mt-8">{children}</main>
    </div>
  );
}
