import { dashboardGuard } from "@/packages/auth/helper";

export default async function DashboardCoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await dashboardGuard();
  return <div className="mb-10 md:ml-12">{children}</div>;
}
