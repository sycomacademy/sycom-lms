"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Loader2Icon, MailIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { CreateUserDialog } from "@/components/dashboard/admin/users/create-user-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";
import { ROLE_LABELS } from "@/packages/utils/schema";
import { capitalize } from "@/packages/utils/string";

type Invite = RouterOutputs["admin"]["listPublicInvites"]["invites"][number];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "expired", label: "Expired" },
  { value: "revoked", label: "Revoked" },
] as const;

const STATUS_BADGE_VARIANTS: Record<
  Invite["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  accepted: "secondary",
  expired: "outline",
  pending: "default",
  revoked: "destructive",
};

function PublicInvitesEmptyState() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MailIcon />
        </EmptyMedia>
        <EmptyTitle>No invites found</EmptyTitle>
        <EmptyDescription>
          Create your first creator or admin invite to get started.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function PublicInvitesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <div className="border-b bg-muted/30 px-4 py-3">
          <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_0.9fr_0.8fr_0.8fr_60px] gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="ml-auto h-4 w-10" />
          </div>
        </div>

        <div className="divide-y">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_0.9fr_0.8fr_0.8fr_60px] items-center gap-4 px-4 py-4"
              key={index}
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
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

export function PublicInvitesTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<(typeof STATUS_OPTIONS)[number]["value"]>("all");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const query = useQuery(
    trpc.admin.listPublicInvites.queryOptions({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      search: search || undefined,
      statuses: status === "all" ? undefined : [status],
    })
  );

  const revokeMutation = useMutation(
    trpc.admin.revokePublicInvite.mutationOptions({
      onMutate: ({ inviteId }) => {
        setRevokingId(inviteId);
      },
      onSuccess: () => {
        toastManager.add({
          title: "Invite revoked",
          description: "The invite is no longer usable.",
          type: "success",
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.listPublicInvites.queryKey(),
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to revoke invite",
          description: error.message,
          type: "error",
        });
      },
      onSettled: () => {
        setRevokingId(null);
      },
    })
  );

  const columns = useMemo<ColumnDef<Invite, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: 180,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 220,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 140,
        cell: ({ row }) => ROLE_LABELS[row.original.role],
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE_VARIANTS[row.original.status]}>
            {capitalize(row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: "inviterName",
        header: "Invited by",
        size: 140,
      },
      {
        accessorKey: "expiresAt",
        header: "Expires",
        size: 140,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs tabular-nums">
            {new Date(row.original.expiresAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        size: 140,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs tabular-nums">
            {new Date(row.original.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        size: 60,
        cell: ({ row }) => {
          const isRevokable = row.original.status === "pending";
          const isRevoking = revokingId === row.original.id;

          return (
            <Button
              disabled={!isRevokable || isRevoking}
              onClick={() =>
                revokeMutation.mutate({ inviteId: row.original.id })
              }
              size="icon-sm"
              variant="ghost"
            >
              {isRevoking ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <Trash2Icon className="size-4" />
              )}
            </Button>
          );
        },
      },
    ],
    [revokingId, revokeMutation.mutate]
  );

  const invites = query.data?.invites ?? [];
  const total = query.data?.total ?? 0;
  const dataLoaded = Boolean(query.data) || !query.isPending;

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          {query.isFetching ? (
            <Loader2Icon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            className="pl-8"
            onChange={(event) => {
              setSearch(event.target.value);
              setPagination((current) => ({ ...current, pageIndex: 0 }));
            }}
            placeholder="Search by name or email..."
            value={search}
          />
        </div>
        <CreateUserDialog />
      </div>

      <div className="flex items-center gap-2">
        <Select
          onValueChange={(nextValue) => {
            setStatus(nextValue as (typeof STATUS_OPTIONS)[number]["value"]);
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
          value={status}
        >
          <SelectTrigger className="w-44">
            <SelectValue>{capitalize(status)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!dataLoaded && <PublicInvitesTableSkeleton />}
      {dataLoaded && invites.length === 0 && <PublicInvitesEmptyState />}
      {dataLoaded && invites.length > 0 && (
        <DataTable
          columns={columns}
          data={invites}
          manualPagination
          onPaginationChange={setPagination}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          total={total}
        />
      )}
    </div>
  );
}
