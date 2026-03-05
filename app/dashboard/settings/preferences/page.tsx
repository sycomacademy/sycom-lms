import { dashboardGuard } from "@/packages/auth/helper";

export default async function AccountPreferencesPage() {
  await dashboardGuard();
  return (
    <div className="flex flex-col gap-6">{/* <AccountPreferences /> */}</div>
  );
}
