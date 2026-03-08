"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { BanIcon, Loader2Icon, SearchIcon, UsersIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useDeferredValue, useTransition } from "react";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { CreateUserDialog } from "@/components/dashboard/admin/users/create-user-dialog";
import { UserActions } from "@/components/dashboard/admin/users/user-actions";
import { usersListParsers } from "@/components/dashboard/admin/users/users-list-parsers";
import { MultiSelectFilter } from "@/components/dashboard/courses/multi-select-filter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/packages/trpc/client";
import { getInitials } from "@/packages/utils/string";

const ROLE_OPTIONS = [
  { value: "platform_admin", label: "Admin" },
  { value: "content_creator", label: "Content Creator" },
  { value: "platform_student", label: "Student" },
] as const;

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
  { value: "unverified", label: "Unverified email" },
] as const;

type User = RouterOutputs["admin"]["listUsers"]["users"][number];

const ORG_PREVIEW_LIMIT = 2;

function UserOrganizationsCell({ user }: { user: User }) {
  if (!user.orgCount || user.orgs.length === 0) {
    return (
      <span className="text-muted-foreground text-xs">No organizations</span>
    );
  }

  const preview = user.orgs.slice(0, ORG_PREVIEW_LIMIT).map((org) => org.name);
  const remaining = user.orgCount - preview.length;
  const previewLabel =
    remaining > 0 ? `${preview.join(", ")} +${remaining}` : preview.join(", ");

  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <button className="cursor-help text-left text-xs" type="button" />
        }
      >
        <span className="line-clamp-2 text-foreground">{previewLabel}</span>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-72">
        <div className="mb-2 font-medium text-foreground text-xs">
          Organizations ({user.orgCount})
        </div>
        <div className="max-h-56 space-y-1 overflow-y-auto">
          {user.orgs.map((org) => (
            <div className="rounded-md border px-2 py-1.5" key={org.id}>
              <div className="font-medium text-xs">{org.name}</div>
              <div className="text-muted-foreground text-xs">{org.slug}</div>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

const ROLE_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline"> =
  {
    platform_admin: "default",
    content_creator: "secondary",
    platform_student: "outline",
  };

const ROLE_LABELS: Record<string, string> = {
  platform_admin: "Admin",
  content_creator: "Creator",
  platform_student: "Student",
};

const STATUS_FILTER_LABELS: Record<string, string> = {
  all: "All statuses",
  active: "Active",
  banned: "Banned",
  unverified: "Unverified email",
};

function getColumns(): ColumnDef<User, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      size: 200,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage alt={u.name} src={u.image ?? undefined} />
              <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-medium text-sm">{u.name}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 240,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue("email")}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      size: 130,
      enableSorting: false,
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge
            className="capitalize"
            variant={ROLE_BADGE_VARIANT[role] ?? "outline"}
          >
            {ROLE_LABELS[role] ?? role}
          </Badge>
        );
      },
    },
    {
      id: "organizations",
      header: "Organizations",
      size: 220,
      enableSorting: false,
      cell: ({ row }) => <UserOrganizationsCell user={row.original} />,
    },
    {
      accessorKey: "banned",
      header: "Status",
      size: 100,
      enableSorting: false,
      cell: ({ row }) => {
        const banned = row.original.banned;
        const isEmailVerified = row.original.emailVerified;
        if (banned) {
          return (
            <Badge variant="destructive">
              <BanIcon className="size-3" />
              Banned
            </Badge>
          );
        }
        if (!isEmailVerified) {
          return (
            <Badge variant="outline">
              <span className="size-1.5 rounded-full bg-warning" />
              Unverified email
            </Badge>
          );
        }
        return (
          <Badge variant="outline">
            <span className="size-1.5 rounded-full bg-success" />
            Active
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      size: 140,
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt") as string);
        return (
          <span className="text-muted-foreground text-xs tabular-nums">
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      size: 50,
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <UserActions
            isBanned={u.banned ?? false}
            isEmailVerified={u.emailVerified}
            userEmail={u.email}
            userId={u.id}
            userName={u.name}
            userRole={u.role ?? "platform_student"}
          />
        );
      },
    },
  ];
}

export function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <div className="border-b bg-muted/30 px-4 py-3">
          <div className="grid grid-cols-[1.2fr_1.4fr_0.7fr_1fr_0.6fr_0.8fr_60px] gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="ml-auto h-4 w-12" />
          </div>
        </div>

        <div className="divide-y">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              className="grid grid-cols-[1.2fr_1.4fr_0.7fr_1fr_0.6fr_0.8fr_60px] items-center gap-4 px-4 py-4"
              key={index}
            >
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <div className="ml-auto flex gap-2">
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UsersEmptyState() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <UsersIcon />
        </EmptyMedia>
        <EmptyTitle>No users found</EmptyTitle>
        <EmptyDescription>
          Try adjusting your search or filters to find what you need.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function UsersTable() {
  const trpc = useTRPC();
  const [, startTransition] = useTransition();

  const [
    {
      search,
      roles: filterRoles,
      statuses: filterStatuses,
      sortBy,
      sortDirection,
      page,
      pageSize,
    },
    setParams,
  ] = useQueryStates(usersListParsers);

  const pageIndex = Math.max(0, page - 1);
  const pagination = {
    pageIndex,
    pageSize,
  };
  const deferredSearch = useDeferredValue(search);
  const deferredFilterRoles = useDeferredValue(filterRoles);
  const deferredFilterStatuses = useDeferredValue(filterStatuses);
  const deferredPagination = useDeferredValue(pagination);
  const deferredSortBy = useDeferredValue(sortBy);
  const deferredSortDirection = useDeferredValue(sortDirection);

  const queryOptions = trpc.admin.listUsers.queryOptions({
    limit: deferredPagination.pageSize,
    offset: deferredPagination.pageIndex * deferredPagination.pageSize,
    search: deferredSearch || undefined,
    filterRoles:
      deferredFilterRoles.length > 0 ? deferredFilterRoles : undefined,
    filterStatuses:
      deferredFilterStatuses.length > 0 ? deferredFilterStatuses : undefined,
    sortBy: deferredSortBy,
    sortDirection: deferredSortDirection,
  });

  const { data, isFetching, isPending } = useQuery(queryOptions);

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const dataLoaded = Boolean(data) || !isPending;

  const handleTablePaginationChange = (next: PaginationState) => {
    startTransition(() => {
      setParams({ page: next.pageIndex + 1, pageSize: next.pageSize });
    });
  };

  const handleTableSortingChange = (next: SortingState) => {
    const nextSort = next[0];
    startTransition(() => {
      setParams({
        page: 1,
        sortBy: (nextSort?.id as "name" | "email" | "createdAt") ?? "createdAt",
        sortDirection: nextSort?.desc === false ? "asc" : "desc",
      });
    });
  };

  const columns = getColumns();

  const statusFilterValue =
    filterStatuses.length === 0 ? "all" : filterStatuses[0];

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          {isFetching ? (
            <Loader2Icon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            className="pl-8"
            onChange={(event) =>
              setParams({ search: event.target.value, page: 1 })
            }
            placeholder="Search by name or email..."
            value={search}
          />
        </div>
        <CreateUserDialog />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          allLabel="All roles"
          className="w-40"
          onChange={(nextRoles) =>
            setParams({
              page: 1,
              roles: nextRoles as typeof filterRoles,
            })
          }
          options={[...ROLE_OPTIONS]}
          resetLabel="Reset"
          showAllAsUnchecked
          triggerLabel="Role"
          value={filterRoles as string[]}
        />
        <Select
          onValueChange={(v) => {
            if (v) {
              startTransition(() => {
                setParams({
                  page: 1,
                  statuses:
                    v === "all"
                      ? []
                      : [v as "active" | "banned" | "unverified"],
                });
              });
            }
          }}
          value={statusFilterValue}
        >
          <SelectTrigger className="w-40 data-[size=default]:h-9">
            <SelectValue>
              {STATUS_FILTER_LABELS[statusFilterValue] ?? "All statuses"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!dataLoaded && <UsersTableSkeleton />}
      {dataLoaded && users.length === 0 && <UsersEmptyState />}
      {dataLoaded && users.length > 0 && (
        <DataTable
          columns={columns}
          data={users}
          manualPagination
          manualSorting
          onPaginationChange={handleTablePaginationChange}
          onSortingChange={handleTableSortingChange}
          pageIndex={pageIndex}
          pageSize={pagination.pageSize}
          sorting={[{ id: sortBy, desc: sortDirection === "desc" }]}
          total={total}
        />
      )}
    </div>
  );
}
