import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/packages/auth/helper";
import { SignOutButton } from "./sign-out-button";
import { TestToast } from "./test-toast";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-semibold text-xl tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back. Your learning overview will appear here.
          </p>
        </div>
        <SignOutButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Current session data</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-auto rounded-md bg-muted p-4 font-mono text-xs">
            {JSON.stringify(session, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card className="max-w-md">
        <TestToast />
      </Card>
    </div>
  );
}
