"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { BuildingIcon, UsersIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/packages/trpc/client";

export function OrgOverviewClient() {
  const trpc = useTRPC();

  const { data: org } = useSuspenseQuery(
    trpc.org.getOrganization.queryOptions()
  );
  const { data: cohortsData } = useSuspenseQuery(
    trpc.org.listCohorts.queryOptions()
  );
  const { data: membersData } = useSuspenseQuery(
    trpc.org.listMembers.queryOptions()
  );

  const base = `/dashboard/org/${org.slug}`;
  const stats = [
    {
      label: "Members",
      value: (membersData as { members: unknown[] }).members.length,
      icon: UsersIcon,
      href: `${base}/people`,
    },
    {
      label: "Cohorts",
      value: (cohortsData as { cohorts: unknown[] }).cohorts.length,
      icon: BuildingIcon,
      href: `${base}/cohorts`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-xl">Organization overview</h1>
        <p className="text-muted-foreground text-sm">
          Summary of your organization.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link href={href as Route} key={label}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">{label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl tabular-nums">{value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
