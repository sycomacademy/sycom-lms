import { dashboardGuard } from "@/packages/auth/helper";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await dashboardGuard();
  return <>{children}</>;
}
