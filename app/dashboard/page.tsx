import { DashboardOverviewChart } from "@/components/dashboard/dashboard-overview-chart";
import { DashboardStatCards } from "@/components/dashboard/dashboard-stat-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/packages/auth/helper";

export default async function DashboardPage() {
  const session = await getSession();
  const userName =
    session?.user?.name ?? (session?.user?.email ?? "there").split("@")[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-semibold text-foreground text-lg tracking-tight">
          Welcome back, {userName}
        </h2>
        <p className="text-muted-foreground text-sm">
          Here’s what’s happening on your learning platform.
        </p>
      </div>

      <DashboardStatCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Enrollments</CardTitle>
            <CardDescription>
              Enrollment trend over the last 7 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardOverviewChart />
          </CardContent>
        </Card>

        <Card>
          <RecentActivity />
        </Card>
      </div>
    </div>
  );
}
