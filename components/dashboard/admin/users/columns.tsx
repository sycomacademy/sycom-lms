"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserActions } from "./user-actions";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: "admin" | "instructor" | "student" | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
}

function getRoleBadgeVariant(
  role: User["role"]
): "default" | "secondary" | "outline" {
  if (role === "admin") {
    return "default";
  }
  if (role === "instructor") {
    return "secondary";
  }
  return "outline";
}

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const isAllSelected = table.getIsAllPageRowsSelected();
      const isSomeSelected = table.getIsSomePageRowsSelected();
      return (
        <Checkbox
          aria-label="Select all rows"
          checked={isAllSelected}
          indeterminate={isSomeSelected && !isAllSelected}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      );
    },
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    size: 28,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as User["role"];
      return (
        <Badge variant={getRoleBadgeVariant(role)}>{role ?? "student"}</Badge>
      );
    },
  },
  {
    accessorKey: "banned",
    header: "Status",
    cell: ({ row }) => {
      const banned = row.original.banned;
      const banReason = row.original.banReason;
      return (
        <div className="flex items-center gap-2">
          {banned ? (
            <Badge title={banReason ?? undefined} variant="destructive">
              Banned
            </Badge>
          ) : (
            <Badge
              className="border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
              variant="outline"
            >
              Active
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return (
        <div className="text-muted-foreground tabular-nums">
          {format(new Date(date), "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <UserActions user={row.original} />,
    size: 40,
  },
];
