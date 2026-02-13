import AuthCheck from "@/components/auth/auth-check";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardSettingsPage() {
  <AuthCheck isOnLoggedInPage={true} />;
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Platform configuration will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
