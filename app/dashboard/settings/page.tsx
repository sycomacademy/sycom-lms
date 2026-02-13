import AuthCheck from "@/components/auth/auth-check";
import { AccountGeneral } from "@/components/dashboard/settings/account-general";

export default function DashboardAccountPage() {
  <AuthCheck isOnLoggedInPage={true} />;
  return (
    <div className="flex flex-col gap-6">
      <AccountGeneral />
    </div>
  );
}
