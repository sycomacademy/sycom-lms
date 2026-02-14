"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/packages/trpc/client";
import { columns, type User } from "./columns";
import { CreateUserDialog } from "./create-user-dialog";
import { DataTable } from "./data-table";

export function UsersTable() {
  const trpc = useTRPC();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt">(
    "createdAt"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterRole, setFilterRole] = useState<
    "admin" | "instructor" | "student" | undefined
  >(undefined);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data } = useSuspenseQuery(
    trpc.admin.listUsers.queryOptions({
      limit: pageSize,
      offset: page * pageSize,
      search: search || undefined,
      sortBy,
      sortDirection,
      filterRole,
    })
  );

  const totalPages = Math.ceil((data?.total ?? 0) / pageSize);

  const handleSort = (column: "name" | "email" | "createdAt") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
    setPage(0);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            className="w-full sm:w-[300px]"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search users..."
            value={search}
          />
          <Select
            onValueChange={(value) => {
              setFilterRole(
                value === "all"
                  ? undefined
                  : (value as "admin" | "instructor" | "student")
              );
              setPage(0);
            }}
            value={filterRole ?? "all"}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Sort indicators */}
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <span>Sort by:</span>
        {(["name", "email", "createdAt"] as const).map((column) => (
          <Button
            className="h-auto px-2 py-1"
            key={column}
            onClick={() => handleSort(column)}
            size="sm"
            variant="ghost"
          >
            {column.charAt(0).toUpperCase() + column.slice(1)}
            {sortBy === column &&
              (sortDirection === "asc" ? (
                <ChevronUpIcon className="ml-1 h-3 w-3" />
              ) : (
                <ChevronDownIcon className="ml-1 h-3 w-3" />
              ))}
          </Button>
        ))}
      </div>

      {/* Table */}
      <DataTable columns={columns} data={(data?.users ?? []) as User[]} />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Showing {page * pageSize + 1} to{" "}
          {Math.min((page + 1) * pageSize, data?.total ?? 0)} of{" "}
          {data?.total ?? 0} users
        </div>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(0);
            }}
            value={String(pageSize)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              size="sm"
              variant="outline"
            >
              Previous
            </Button>
            <span className="px-2 text-sm">
              Page {page + 1} of {totalPages || 1}
            </span>
            <Button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              size="sm"
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Create User Dialog */}
      <CreateUserDialog
        onOpenChange={setShowCreateDialog}
        open={showCreateDialog}
      />
    </div>
  );
}
