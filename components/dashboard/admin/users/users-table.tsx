"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { BanIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { useDeferredValue, useState, useTransition } from "react";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { CreateUserDialog } from "@/components/dashboard/admin/users/create-user-dialog";
import { UserActions } from "@/components/dashboard/admin/users/user-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
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
import { useTRPC } from "@/packages/trpc/client";
import { getInitials } from "@/packages/utils/string";

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

const ROLE_FILTER_LABELS: Record<string, string> = {
  all: "All roles",
  platform_admin: "Admin",
  content_creator: "Content Creator",
  platform_student: "Student",
};

const STATUS_FILTER_LABELS: Record<string, string> = {
  all: "All statuses",
  active: "Active",
  banned: "Banned",
  unverified: "Unverified email",
};

const columns: ColumnDef<User, unknown>[] = [
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

export function UsersTable() {
  const trpc = useTRPC();
  const [, startTransition] = useTransition();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const sortBy =
    (sorting[0]?.id as "name" | "email" | "createdAt") ?? "createdAt";
  const sortDirection = sorting[0]?.desc === false ? "asc" : "desc";

  const queryOptions = trpc.admin.listUsers.queryOptions({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    search: deferredSearch || undefined,
    filterRole:
      filterRole !== "all"
        ? (filterRole as
            | "platform_admin"
            | "content_creator"
            | "platform_student")
        : undefined,
    filterStatus:
      filterStatus !== "all"
        ? (filterStatus as "active" | "banned" | "unverified")
        : undefined,
    sortBy,
    sortDirection,
  });

  const { data } = useSuspenseQuery(queryOptions);
  const isSearching = deferredSearch !== search;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleRoleFilterChange = (value: string) => {
    startTransition(() => {
      setFilterRole(value);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    });
  };

  const handleStatusFilterChange = (value: string) => {
    startTransition(() => {
      setFilterStatus(value);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    });
  };

  const handlePaginationChange = (next: PaginationState) => {
    startTransition(() => {
      setPagination(next);
    });
  };

  const handleSortingChange = (next: SortingState) => {
    startTransition(() => {
      setSorting(next);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative max-w-xs flex-1">
            {isSearching ? (
              <Loader2Icon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : (
              <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            )}
            <Input
              className="pl-8"
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or email..."
              value={search}
            />
          </div>
          <Select
            onValueChange={(v) => {
              if (v) {
                handleRoleFilterChange(v);
              }
            }}
            value={filterRole}
          >
            <SelectTrigger className="w-fit data-[size=default]:h-9">
              <SelectValue>
                {ROLE_FILTER_LABELS[filterRole] ?? "All roles"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="platform_admin">Admin</SelectItem>
              <SelectItem value="content_creator">Content Creator</SelectItem>
              <SelectItem value="platform_student">Student</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(v) => {
              if (v) {
                handleStatusFilterChange(v);
              }
            }}
            value={filterStatus}
          >
            <SelectTrigger className="w-fit data-[size=default]:h-9">
              <SelectValue>
                {STATUS_FILTER_LABELS[filterStatus] ?? "All statuses"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="unverified">Unverified email</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CreateUserDialog />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data.users}
        manualPagination
        manualSorting
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        sorting={sorting}
        total={data.total}
      />
    </div>
  );
}
