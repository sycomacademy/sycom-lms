"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { UsersIcon } from "lucide-react";
import type { Route } from "next";
import { OrgCohortsList } from "@/components/dashboard/org/org-cohorts-list";
import { Link } from "@/components/layout/foresight-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/packages/trpc/client";

export function OrgOverviewClient() {
  const trpc = useTRPC();

  const { data: org } = useSuspenseQuery(
    trpc.org.getOrganization.queryOptions()
  );
  const { data: membersData } = useSuspenseQuery(
    trpc.org.listMembers.queryOptions()
  );

  const base = `/dashboard/org/${org.slug}`;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Link href={`${base}/people` as Route}>
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Members</CardTitle>
              <UsersIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl tabular-nums">
                {(membersData as { members: unknown[] }).members.length}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Separator />

      <OrgCohortsList />
    </div>
  );
}
