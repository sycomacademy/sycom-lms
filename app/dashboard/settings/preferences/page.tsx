import AuthCheck from "@/components/auth/auth-check";
import { AccountPreferences } from "@/components/dashboard/settings/account-preferences";

export default function AccountPreferencesPage() {
  <AuthCheck isOnLoggedInPage={true} />;
  return (
    <div className="flex flex-col gap-6">
      <AccountPreferences />
    </div>
  );
}
