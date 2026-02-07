import { BellIcon, MailIcon } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/packages/auth/auth";

export default async function SettingsNotificationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      {/* Email notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email notifications</CardTitle>
          <p className="text-muted-foreground text-sm">
            Choose which emails you want to receive.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <MailIcon className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">Email preferences</p>
              <p className="text-muted-foreground text-xs">
                Email notification settings will be available soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Push notifications</CardTitle>
          <p className="text-muted-foreground text-sm">
            Control browser and mobile push notifications.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <BellIcon className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">Push preferences</p>
              <p className="text-muted-foreground text-xs">
                Push notification settings will be available soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
