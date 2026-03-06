"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { BuildingIcon, FileTextIcon, UsersIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/packages/trpc/client";
import { DashboardGreeting } from "./dashboard-greeting";

export function AdminOverviewClient() {
  const trpc = useTRPC();

  const { data: usersData } = useSuspenseQuery(
    trpc.admin.listUsers.queryOptions({
      limit: 10,
      offset: 0,
      sortBy: "createdAt",
      sortDirection: "desc",
    })
  );
  const { data: orgsData } = useSuspenseQuery(
    trpc.admin.listOrganizations.queryOptions({ limit: 10, offset: 0 })
  );
  const { data: reportsData } = useSuspenseQuery(
    trpc.admin.listReports.queryOptions({
      limit: 5,
      offset: 0,
      type: "report",
      status: "pending",
    })
  );

  const stats = [
    {
      label: "Total users",
      value: usersData.total,
      description: "Registered platform users",
      icon: UsersIcon,
      href: "/dashboard/admin/users",
    },
    {
      label: "Organizations",
      value: orgsData.total,
      description: "Active organizations",
      icon: BuildingIcon,
      href: "/dashboard/admin/organizations",
    },
    {
      label: "Pending reports",
      value: reportsData.total,
      description: "Awaiting review",
      icon: FileTextIcon,
      href: "/dashboard/admin/reports?status=pending",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <DashboardGreeting />
        <p className="mt-1 text-muted-foreground text-sm">
          Platform overview and activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, description, icon: Icon, href }) => (
          <Link href={href as Route} key={label}>
            <Card className="transition-colors hover:bg-muted/50" size="sm">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="font-medium text-muted-foreground text-sm">
                  {label}
                </CardTitle>
                <span className="rounded-md bg-muted p-2">
                  <Icon className="size-4 text-muted-foreground" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-2xl tabular-nums tracking-tight">
                  {value}
                </p>
                <CardDescription>{description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Separator />

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
