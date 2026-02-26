"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserQuery } from "@/packages/hooks/use-user";

export function UserDashboard() {
  const { data: user, isPending } = useUserQuery();

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 rounded-none" />
        <Skeleton className="h-48 rounded-none" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unable to load your profile</CardTitle>
          <CardDescription>
            Please refresh the page. If this continues, sign in again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {user.name}</CardTitle>
          <CardDescription>
            Here is your account snapshot while we build out the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
          <div>
            <Badge variant={user.emailVerified ? "default" : "outline"}>
              {user.emailVerified ? "Email verified" : "Email not verified"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick status</CardTitle>
          <CardDescription>
            Temporary placeholder metrics for the first dashboard version.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Courses in progress: 0</p>
          <p>Labs completed: 0</p>
          <p>Certifications tracked: 0</p>
        </CardContent>
      </Card>
    </div>
  );
}
