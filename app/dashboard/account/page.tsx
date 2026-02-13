import AuthCheck from "@/components/auth/auth-check";
import { AccountGeneral } from "@/components/dashboard/account/account-general";
import { AccountPreferences } from "@/components/dashboard/account/account-preferences";
import { AccountSecurity } from "@/components/dashboard/account/account-security";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardAccountPage() {
  <AuthCheck isOnLoggedInPage={true} />;
  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="general">
        <TabsList className="gap-4" variant="line">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent className="mt-6" value="general">
          <AccountGeneral />
        </TabsContent>
        <TabsContent className="mt-6" value="security">
          <AccountSecurity />
        </TabsContent>
        <TabsContent className="mt-6" value="preferences">
          <AccountPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
}
