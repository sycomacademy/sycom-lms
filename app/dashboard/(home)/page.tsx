import { BuildingIcon, FileTextIcon, UsersIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/packages/auth/helper";
import { getCaller } from "@/packages/trpc/server";

async function AdminOverview() {
  const caller = await getCaller();

  const [usersData, orgsData, reportsData] = await Promise.all([
    caller.admin.listUsers({
      limit: 5,
      offset: 0,
      sortBy: "createdAt",
      sortDirection: "desc",
    }),
    caller.admin.listOrganizations({ limit: 1, offset: 0 }),
    caller.admin.listReports({
      limit: 5,
      offset: 0,
      type: "all",
      status: "pending",
    }),
  ]);

  const stats = [
    {
      label: "Total users",
      value: usersData.total,
      icon: UsersIcon,
    },
    {
      label: "Organizations",
      value: orgsData.total,
      icon: BuildingIcon,
    },
    {
      label: "Pending reports",
      value: reportsData.total,
      icon: FileTextIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-xl">Platform overview</h1>
        <p className="text-muted-foreground text-sm">
          Summary of platform activity and health.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">{label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl tabular-nums">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent users */}
      <div className="space-y-3">
        <h2 className="font-medium text-sm">Recent sign-ups</h2>
        <div className="divide-y rounded-md border">
          {usersData.users.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground text-sm">
              No users yet
            </p>
          ) : (
            usersData.users.map((u) => (
              <div
                className="flex items-center justify-between px-4 py-3"
                key={u.id}
              >
                <div>
                  <p className="font-medium text-sm">{u.name}</p>
                  <p className="text-muted-foreground text-xs">{u.email}</p>
                </div>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {new Date(u.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default async function DashboardHomePage() {
  const session = await getSession();
  const role = session?.user?.role;

  if (role === "platform_admin") {
    return <AdminOverview />;
  }

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-semibold text-xl">Welcome back</h1>
      <p className="text-muted-foreground text-sm">
        Select a section from the sidebar to get started.
      </p>
    </div>
  );
}
