"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Building2,
  Clock3,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Route } from "next";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { AdminSignupsChart } from "@/components/dashboard/overview/admin-signups-chart";
import {
  OverviewListEmpty,
  OverviewSectionSkeleton,
  OverviewStatCard,
  OverviewStatsSkeleton,
} from "@/components/dashboard/overview/overview-primitives";
import { Link } from "@/components/layout/foresight-link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { getAdminOverview } from "@/packages/db/queries";
import { useTRPC } from "@/packages/trpc/client";

const OVERVIEW_REFETCH_INTERVAL_MS = 60 * 1000;

type AdminOverviewData = Awaited<ReturnType<typeof getAdminOverview>>;

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getInboxMeta(item: {
  type: "report" | "feedback";
  category: string | null;
  status: string | null;
}) {
  if (item.type === "feedback") {
    return "Feedback";
  }

  return item.status
    ? `${item.category ?? "Report"} - ${item.status}`
    : (item.category ?? "Report");
}

export function AdminOverview() {
  const trpc = useTRPC();
  const queryOptions = trpc.overview.admin.queryOptions();
  const { data } = useQuery({
    ...queryOptions,
    refetchInterval: OVERVIEW_REFETCH_INTERVAL_MS,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <DashboardGreeting />
        <p className="text-muted-foreground text-sm">
          Keep an eye on platform growth, open admin work, and the latest
          incoming requests.
        </p>
      </div>

      {data ? <AdminStatsSection data={data} /> : <OverviewStatsSkeleton />}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {data ? <AdminChartSection data={data} /> : <OverviewSectionSkeleton />}

        {data ? (
          <AdminRecentUsersSection data={data} />
        ) : (
          <OverviewSectionSkeleton />
        )}
      </div>

      {data ? (
        <AdminInboxSection data={data} />
      ) : (
        <OverviewSectionSkeleton className="h-72" />
      )}
    </div>
  );
}

function AdminStatsSection({ data }: { data: AdminOverviewData }) {
  const { totals } = data;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <OverviewStatCard
        description="Total user accounts across every platform role."
        icon={Users}
        title="Users"
        value={totals.users.toLocaleString()}
      />
      <OverviewStatCard
        description="Non-public organizations currently active on the platform."
        icon={Building2}
        title="Organizations"
        value={totals.organizations.toLocaleString()}
      />
      <OverviewStatCard
        description="Open creator and admin invites that have not expired yet."
        icon={ShieldCheck}
        title="Active invites"
        value={totals.activeInvites.toLocaleString()}
      />
      <OverviewStatCard
        description="Reports still waiting for the admin team to triage."
        icon={AlertTriangle}
        title="Pending reports"
        value={totals.pendingReports.toLocaleString()}
      />
    </div>
  );
}

function AdminChartSection({ data }: { data: AdminOverviewData }) {
  return <AdminSignupsChart data={data.signupsByDay} />;
}

function AdminRecentUsersSection({ data }: { data: AdminOverviewData }) {
  const { recentUsers } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest signups</CardTitle>
        <CardDescription>Recently created users.</CardDescription>
      </CardHeader>
      <CardContent>
        {recentUsers.length === 0 ? (
          <OverviewListEmpty
            description="New accounts will show up here once people start joining the platform."
            title="No recent users"
          />
        ) : (
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                className="flex items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                key={user.id}
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium text-sm">{user.name}</p>
                  <p className="truncate text-muted-foreground text-xs">
                    {user.email}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">
                    {user.role ? user.role.replace("_", " ") : "unassigned"}
                  </Badge>
                  <span className="text-muted-foreground text-xs">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdminInboxSection({ data }: { data: AdminOverviewData }) {
  const { recentInbox } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent inbox</CardTitle>
        <CardDescription>
          Latest reports and feedback items that surfaced across the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentInbox.length === 0 ? (
          <OverviewListEmpty
            description="New reports and feedback will appear here for faster triage."
            title="Inbox is clear"
          />
        ) : (
          <div className="space-y-3">
            {recentInbox.map((item) => (
              <Link
                className="flex items-start justify-between gap-3 border-b pb-3 transition-colors last:border-b-0 last:pb-0 hover:bg-muted/40"
                href={"/dashboard/admin/reports" as Route}
                key={`${item.type}-${item.id}`}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={item.type === "report" ? "default" : "secondary"}
                    >
                      {item.type}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {getInboxMeta(item)}
                    </span>
                  </div>
                  <p className="truncate font-medium text-sm">
                    {item.subject ?? item.message ?? "Untitled message"}
                  </p>
                  <p className="truncate text-muted-foreground text-xs">
                    {item.email}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-muted-foreground text-xs">
                  <Clock3 className="size-3.5" />
                  {formatDate(item.createdAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
