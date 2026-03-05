import { dashboardGuard } from "@/packages/auth/helper";

export default async function DashboardAccountPage() {
  await dashboardGuard();
  return <div className="flex flex-col gap-6">{/* <AccountGeneral /> */}</div>;
}
