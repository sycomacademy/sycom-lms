"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import {
  BookOpenIcon,
  BuildingIcon,
  CheckIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";

type Org = RouterOutputs["admin"]["listOrganizations"]["orgs"][number];

const slugRegex = /^[a-z0-9-]+$/;

const createOrgSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(60)
    .regex(slugRegex, "Lowercase letters, numbers, and hyphens only"),
  ownerEmail: z.string().email("Invalid email address"),
});

type CreateOrgInput = z.infer<typeof createOrgSchema>;

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function CreateOrgDialog() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<CreateOrgInput>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: "", slug: "", ownerEmail: "" },
  });

  const createMutation = useMutation(
    trpc.admin.createOrganization.mutationOptions({
      onSuccess: (data) => {
        toastManager.add({
          title: "Organization created",
          description: `"${data.name}" has been created.`,
          type: "success",
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.listOrganizations.queryKey(),
        });
        form.reset();
        setOpen(false);
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to create organization",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const onSubmit = (data: CreateOrgInput) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          form.reset();
        }
      }}
      open={open}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon />
        New organization
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create organization</DialogTitle>
          <DialogDescription>
            Create a new organization and assign an owner.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogPanel scrollFade={false}>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel className="text-xs">
                          Organization name
                        </FieldLabel>
                        <FormControl>
                          <Input
                            placeholder="Acme Corp"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const currentSlug = form.getValues("slug");
                              const autoSlug = toSlug(
                                form.getValues("name") || ""
                              );
                              if (!currentSlug || currentSlug === autoSlug) {
                                form.setValue("slug", toSlug(e.target.value));
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel className="text-xs">Slug</FieldLabel>
                        <FormControl>
                          <Input
                            placeholder="acme-corp"
                            {...field}
                            onChange={(e) => {
                              field.onChange(
                                e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, "-")
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ownerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel className="text-xs">Owner email</FieldLabel>
                        <FormControl>
                          <Input
                            placeholder="owner@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </Field>
                    </FormItem>
                  )}
                />
              </div>
            </DialogPanel>
            <DialogFooter>
              <Button
                disabled={createMutation.isPending}
                size="sm"
                type="submit"
              >
                {createMutation.isPending ? <Spinner /> : null}
                Create organization
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Entitlements Sheet
// ---------------------------------------------------------------------------

function EntitlementsSheet({
  org,
  open,
  onOpenChange,
}: {
  org: Org;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const { data: entitlements, isPending: entitlementsLoading } = useQuery({
    ...trpc.entitlement.list.queryOptions({ organizationId: org.id }),
    enabled: open,
  });

  const { data: coursesData } = useQuery({
    ...trpc.entitlement.courses.queryOptions(),
    enabled: open,
  });

  const grantMutation = useMutation(
    trpc.entitlement.grant.mutationOptions({
      onSuccess: () => {
        toastManager.add({
          title: "Course granted",
          description: "Entitlement has been added.",
          type: "success",
        });
        setSelectedCourseId("");
        queryClient.invalidateQueries({
          queryKey: trpc.entitlement.list.queryKey({ organizationId: org.id }),
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to grant course",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const revokeMutation = useMutation(
    trpc.entitlement.revoke.mutationOptions({
      onSuccess: () => {
        toastManager.add({
          title: "Entitlement revoked",
          type: "success",
        });
        queryClient.invalidateQueries({
          queryKey: trpc.entitlement.list.queryKey({ organizationId: org.id }),
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to revoke",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  // Filter out courses already entitled (active ones)
  const entitledCourseIds = new Set(
    (entitlements ?? []).filter((e) => e.isActive).map((e) => e.courseId)
  );
  const availableCourses = (coursesData?.courses ?? []).filter(
    (c) => !entitledCourseIds.has(c.id)
  );

  const handleGrant = () => {
    if (!selectedCourseId) {
      return;
    }
    grantMutation.mutate({
      organizationId: org.id,
      courseId: selectedCourseId,
    });
  };

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{org.name}</SheetTitle>
          <SheetDescription>
            Manage course entitlements for this organization.
          </SheetDescription>
        </SheetHeader>
        <SheetPanel>
          <div className="flex flex-col gap-6">
            {/* Grant new course */}
            <div className="space-y-2">
              <p className="font-medium text-sm">Grant a course</p>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    onValueChange={(v) => setSelectedCourseId(v as string)}
                    value={selectedCourseId || undefined}
                  >
                    <SelectTrigger className="w-full" size="sm">
                      <SelectValue placeholder="Select a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.length === 0 ? (
                        <div className="px-3 py-2 text-muted-foreground text-sm">
                          No courses available
                        </div>
                      ) : (
                        availableCourses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  disabled={!selectedCourseId || grantMutation.isPending}
                  onClick={handleGrant}
                  size="sm"
                >
                  {grantMutation.isPending ? <Spinner /> : <PlusIcon />}
                  Grant
                </Button>
              </div>
            </div>

            {/* Current entitlements */}
            <div className="space-y-2">
              <p className="font-medium text-sm">
                Current entitlements{" "}
                {entitlements && (
                  <span className="text-muted-foreground">
                    ({entitlements.filter((e) => e.isActive).length})
                  </span>
                )}
              </p>

              {entitlementsLoading && (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton className="h-14 w-full rounded-md" key={i} />
                  ))}
                </div>
              )}

              {!entitlementsLoading &&
                (!entitlements || entitlements.length === 0) && (
                  <p className="py-4 text-center text-muted-foreground text-sm">
                    No courses have been granted yet.
                  </p>
                )}

              {entitlements?.map((entitlement) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                  key={entitlement.id}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <BookOpenIcon className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">
                        {entitlement.courseTitle}
                      </p>
                      <div className="flex items-center gap-2">
                        {entitlement.isActive ? (
                          <Badge className="rounded-full" variant="default">
                            <CheckIcon className="size-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="rounded-full" variant="secondary">
                            Revoked
                          </Badge>
                        )}
                        {entitlement.expiresAt && (
                          <span className="text-muted-foreground text-xs">
                            Expires{" "}
                            {new Date(
                              entitlement.expiresAt
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {entitlement.isActive && (
                    <Button
                      disabled={revokeMutation.isPending}
                      onClick={() =>
                        revokeMutation.mutate({
                          organizationId: org.id,
                          courseId: entitlement.courseId,
                        })
                      }
                      size="icon-sm"
                      variant="ghost"
                    >
                      {revokeMutation.isPending ? (
                        <Spinner />
                      ) : (
                        <XIcon className="size-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </SheetPanel>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

function ActionsCell({
  org,
  onManageEntitlements,
}: {
  org: Org;
  onManageEntitlements: (org: Org) => void;
}) {
  return (
    <Button
      onClick={() => onManageEntitlements(org)}
      size="icon-sm"
      variant="ghost"
    >
      <SettingsIcon className="size-4" />
    </Button>
  );
}

function useOrgColumns(onManageEntitlements: (org: Org) => void) {
  const columns: ColumnDef<Org, unknown>[] = [
    {
      accessorKey: "name",
      header: "Organization",
      size: 220,
      cell: ({ row }) => {
        const org = row.original;
        return (
          <div className="flex items-center gap-2">
            {org.logo ? (
              <Avatar className="size-8 rounded-md">
                <AvatarFallback className="rounded-md text-xs">
                  <BuildingIcon className="size-4" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="size-8 rounded-md">
                <AvatarFallback className="rounded-md text-xs">
                  <BuildingIcon className="size-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <div className="min-w-0">
              <div className="truncate font-medium text-sm">{org.name}</div>
              <div className="text-muted-foreground text-xs">{org.slug}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "ownerName",
      header: "Owner",
      size: 200,
      enableSorting: false,
      cell: ({ row }) => {
        const org = row.original;
        if (!org.ownerName) {
          return (
            <span className="text-muted-foreground text-sm">No owner</span>
          );
        }
        return (
          <div className="min-w-0">
            <div className="truncate text-sm">{org.ownerName}</div>
            {org.ownerEmail && (
              <div className="truncate text-muted-foreground text-xs">
                {org.ownerEmail}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "cohortCount",
      header: "Cohorts",
      size: 90,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {row.getValue("cohortCount") ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "memberCount",
      header: "Members",
      size: 90,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {row.getValue("memberCount") ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
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
      header: "",
      size: 50,
      enableSorting: false,
      cell: ({ row }) => (
        <ActionsCell
          onManageEntitlements={onManageEntitlements}
          org={row.original}
        />
      ),
    },
  ];

  return columns;
}

// ---------------------------------------------------------------------------
// Skeleton / Empty
// ---------------------------------------------------------------------------

function OrgsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <div className="border-b bg-muted/30 px-4 py-3">
          <div className="grid grid-cols-[1.2fr_1fr_0.5fr_0.5fr_0.7fr] gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        <div className="divide-y">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              className="grid grid-cols-[1.2fr_1fr_0.5fr_0.5fr_0.7fr] items-center gap-4 px-4 py-4"
              key={index}
            >
              <div className="flex items-center gap-2">
                <Skeleton className="size-8 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrgsEmptyState() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BuildingIcon />
        </EmptyMedia>
        <EmptyTitle>No organizations found</EmptyTitle>
        <EmptyDescription>
          Try adjusting your search or create a new organization.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

// ---------------------------------------------------------------------------
// Main table
// ---------------------------------------------------------------------------

export function OrgsTable() {
  const trpc = useTRPC();
  const [, startTransition] = useTransition();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState("");

  // Sheet state
  const [sheetOrg, setSheetOrg] = useState<Org | null>(null);

  const columns = useOrgColumns((org) => setSheetOrg(org));

  const queryOptions = trpc.admin.listOrganizations.queryOptions({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    search: search || undefined,
  });

  const { data, isFetching, isPending } = useQuery(queryOptions);
  const orgs = data?.orgs ?? [];
  const total = data?.total ?? 0;
  const dataLoaded = Boolean(data) || !isPending;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
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
        <div className="relative max-w-xs flex-1">
          {isFetching ? (
            <Loader2Icon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : (
            <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            className="pl-8"
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search organizations..."
            value={search}
          />
        </div>
        <CreateOrgDialog />
      </div>

      {!dataLoaded && <OrgsTableSkeleton />}
      {dataLoaded && orgs.length === 0 && <OrgsEmptyState />}
      {dataLoaded && orgs.length > 0 && (
        <DataTable
          columns={columns}
          data={orgs}
          manualPagination
          onPaginationChange={handlePaginationChange}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          total={total}
        />
      )}

      {/* Entitlements sheet */}
      {sheetOrg && (
        <EntitlementsSheet
          onOpenChange={(open) => {
            if (!open) {
              setSheetOrg(null);
            }
          }}
          open
          org={sheetOrg}
        />
      )}
    </div>
  );
}
