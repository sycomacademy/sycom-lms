"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { BanIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { useDeferredValue, useState, useTransition } from "react";
import { CreateUserDialog } from "@/components/dashboard/admin/create-user-dialog";
import { UserActions } from "@/components/dashboard/admin/user-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/packages/trpc/client";
import type { RouterOutputs } from "@/packages/trpc/server/router";
import { getInitials } from "@/packages/utils/string";

type User = RouterOutputs["admin"]["listUsers"]["users"][number];

const ROLE_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline"> =
  {
    admin: "default",
    instructor: "secondary",
    student: "outline",
  };

const ROLE_FILTER_LABELS: Record<string, string> = {
  all: "All roles",
  admin: "Admin",
  instructor: "Instructor",
  student: "Student",
};

const columns: ColumnDef<User, unknown>[] = [
  {
    accessorKey: "name",
    header: "Name",
    size: 200,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage alt={user.name} src={user.image ?? undefined} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium text-sm">{user.name}</div>
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
    size: 120,
    enableSorting: false,
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge
          className="capitalize"
          variant={ROLE_BADGE_VARIANT[role] ?? "outline"}
        >
          {role}
        </Badge>
      );
    },
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
      const user = row.original;
      return (
        <UserActions
          isBanned={user.banned ?? false}
          userEmail={user.email}
          userId={user.id}
          userName={user.name}
          userRole={user.role ?? "student"}
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

  const queryOptions = trpc.admin.listUsers.queryOptions({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    search: deferredSearch || undefined,
    filterRole:
      filterRole !== "all"
        ? (filterRole as "admin" | "instructor" | "student")
        : undefined,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const { data } = useSuspenseQuery(queryOptions);
  const isSearching = deferredSearch !== search;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleFilterChange = (value: string) => {
    startTransition(() => {
      setFilterRole(value);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    });
  };

  const handlePaginationChange = (next: PaginationState) => {
    startTransition(() => {
      setPagination(next);
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
                handleFilterChange(v);
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
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="student">Student</SelectItem>
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
        onPaginationChange={handlePaginationChange}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        total={data.total}
      />
    </div>
  );
}
