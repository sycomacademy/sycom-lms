import AuthCheck from "@/components/auth/auth-check";
import { AccountSecurity } from "@/components/dashboard/settings/account-security";

export default function AccountSecurityPage() {
  <AuthCheck isOnLoggedInPage={true} />;
  return (
    <div className="flex flex-col gap-6">
      <AccountSecurity />
    </div>
  );
}
