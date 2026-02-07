import { KeyIcon, ShieldIcon } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/packages/auth/auth";

export default async function SettingsAuthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      {/* Password section */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <p className="text-muted-foreground text-sm">
            Manage your password and sign-in method.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <KeyIcon className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">Password</p>
              <p className="text-muted-foreground text-xs">
                Password management will be available soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security section */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <p className="text-muted-foreground text-sm">
            Review your account security and active sessions.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <ShieldIcon className="size-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">Active sessions</p>
              <p className="text-muted-foreground text-xs">
                Session management will be available soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
