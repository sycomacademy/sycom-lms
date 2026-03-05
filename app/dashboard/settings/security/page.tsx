import { dashboardGuard } from "@/packages/auth/helper";

export default async function AccountSecurityPage() {
  await dashboardGuard();
  return <div className="flex flex-col gap-6">{/* <AccountSecurity /> */}</div>;
}
