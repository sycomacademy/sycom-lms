"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import {
  FileTextIcon,
  LayoutGridIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TableIcon,
  Trash2Icon,
} from "lucide-react";
import { useQueryStates } from "nuqs";
import { Suspense, useDeferredValue, useState, useTransition } from "react";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { BlogCard } from "@/components/dashboard/blog/blog-card";
import { blogListParsers } from "@/components/dashboard/blog/blog-list-parsers";
import {
  BlogPostFormSkeleton,
  CreateBlogPostForm,
  EditBlogPostForm,
} from "@/components/dashboard/blog/blog-post-form";
import { MultiSelectFilter } from "@/components/dashboard/courses/multi-select-filter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";
import { BLOG_STATUS_OPTIONS } from "@/packages/utils/schema";
import { formatCourseDate } from "@/packages/utils/time";

type BlogPost = RouterOutputs["blog"]["list"]["posts"][number];

function getColumns({
  deletePost,
  isDeleting,
  onEdit,
}: {
  deletePost: (postId: string) => void;
  isDeleting: boolean;
  onEdit: (postId: string) => void;
}): ColumnDef<BlogPost, unknown>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      size: 280,
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="line-clamp-1 font-medium">{row.original.title}</p>
          <p className="line-clamp-2 text-muted-foreground text-xs">
            {row.original.excerpt}
          </p>
        </div>
      ),
    },
    {
      id: "author",
      header: "Author",
      size: 160,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.author.name}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      cell: ({ row }) => (
        <Badge className="capitalize" variant="outline">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "publishedAt",
      header: "Published",
      size: 130,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs tabular-nums">
          {row.original.publishedAt
            ? formatCourseDate(row.original.publishedAt)
            : "-"}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      size: 130,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs tabular-nums">
          {formatCourseDate(row.original.updatedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      size: 100,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            disabled={isDeleting}
            onClick={() => deletePost(row.original.id)}
            size="icon-xs"
            variant="destructive"
          >
            <Trash2Icon />
          </Button>
          <Button
            onClick={() => onEdit(row.original.id)}
            size="icon-xs"
            variant="outline"
          >
            <PencilIcon />
          </Button>
        </div>
      ),
    },
  ];
}

export function BlogList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [deletePostTarget, setDeletePostTarget] = useState<BlogPost | null>(
    null
  );
  const [
    { view, search, statuses, sortBy, sortDirection, page, pageSize },
    setParams,
  ] = useQueryStates(blogListParsers);

  const pageIndex = Math.max(0, page - 1);
  const pagination = { pageIndex, pageSize };
  const deferredSearch = useDeferredValue(search);
  const deferredStatuses = useDeferredValue(statuses);
  const deferredPagination = useDeferredValue(pagination);
  const deferredSortBy = useDeferredValue(sortBy);
  const deferredSortDirection = useDeferredValue(sortDirection);

  const { data, isFetching, isPending } = useQuery(
    trpc.blog.list.queryOptions({
      limit: deferredPagination.pageSize,
      offset: deferredPagination.pageIndex * deferredPagination.pageSize,
      search: deferredSearch,
      filterStatuses: deferredStatuses,
      sortBy: deferredSortBy,
      sortDirection: deferredSortDirection,
    })
  );

  const deleteMutation = useMutation(
    trpc.blog.delete.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.blog.list.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.blog.listPublic.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.blog.getById.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.blog.getPublicBySlug.queryKey(),
          }),
        ]);
        setDeletePostTarget(null);
        toastManager.add({ title: "Blog post deleted", type: "success" });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to delete blog post",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pagination.pageSize);
  const startCount =
    total === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const endCount = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    total
  );

  const columns = getColumns({
    deletePost: (postId) => {
      const post = posts.find((item) => item.id === postId);
      if (post) {
        setDeletePostTarget(post);
      }
    },
    isDeleting: deleteMutation.isPending,
    onEdit: setEditPostId,
  });

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
        sortBy:
          (nextSort?.id as
            | "title"
            | "createdAt"
            | "updatedAt"
            | "publishedAt"
            | "status") ?? "updatedAt",
        sortDirection: nextSort?.desc === false ? "asc" : "desc",
      });
    });
  };

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
              setParams({ page: 1, search: event.target.value })
            }
            placeholder="Search posts..."
            value={search}
          />
        </div>

        <Sheet onOpenChange={setCreateOpen} open={createOpen}>
          <SheetTrigger
            render={
              <Button size="sm">
                <PlusIcon className="size-4" />
                <span className="hidden sm:inline">Create post</span>
              </Button>
            }
          />
          <SheetContent
            className="sm:max-w-4xl lg:max-w-5xl"
            side="right"
            variant="inset"
          >
            <SheetHeader>
              <SheetTitle>Create post</SheetTitle>
              <SheetDescription>
                Draft a blog post, add the full article content, and publish
                when ready.
              </SheetDescription>
            </SheetHeader>
            <SheetPanel className="max-w-none">
              <CreateBlogPostForm onSuccess={() => setCreateOpen(false)} />
            </SheetPanel>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <MultiSelectFilter
          allLabel="All statuses"
          className="w-40"
          onChange={(nextStatuses) =>
            setParams({ page: 1, statuses: nextStatuses as typeof statuses })
          }
          options={[...BLOG_STATUS_OPTIONS]}
          resetLabel="Reset"
          showAllAsUnchecked
          triggerLabel="Status"
          value={statuses as string[]}
        />

        <Tabs
          onValueChange={(nextView) =>
            setParams({
              page: 1,
              pageSize: nextView === "table" ? 10 : 12,
              view: nextView as "card" | "table",
            })
          }
          value={view}
        >
          <TabsList>
            <TabsTab value="card">
              <LayoutGridIcon className="size-4" />
              Card
            </TabsTab>
            <TabsTab value="table">
              <TableIcon className="size-4" />
              Table
            </TabsTab>
          </TabsList>
        </Tabs>
      </div>

      <BlogResults
        columns={columns}
        dataLoaded={Boolean(data) || !isPending}
        onDelete={(postId) => {
          const post = posts.find((item) => item.id === postId);
          if (post) {
            setDeletePostTarget(post);
          }
        }}
        onEdit={setEditPostId}
        onTablePaginationChange={handleTablePaginationChange}
        onTableSortingChange={handleTableSortingChange}
        pageIndex={pageIndex}
        pageSize={pagination.pageSize}
        posts={posts}
        sorting={[{ id: sortBy, desc: sortDirection === "desc" }]}
        total={total}
        view={view}
      />

      {view === "card" && totalPages > 1 ? (
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Showing{" "}
            <span className="font-medium text-foreground">
              {startCount}-{endCount}
            </span>{" "}
            of <span className="font-medium text-foreground">{total}</span>
          </p>

          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={pageIndex === 0}
                  className={
                    pageIndex === 0
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    if (pageIndex > 0) {
                      setParams({ page: page - 1 });
                    }
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  isActive
                  onClick={(event) => event.preventDefault()}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink onClick={(event) => event.preventDefault()}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  aria-disabled={pageIndex >= totalPages - 1}
                  className={
                    pageIndex >= totalPages - 1
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    if (pageIndex < totalPages - 1) {
                      setParams({ page: page + 1 });
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}

      <Sheet
        onOpenChange={(open) => !open && setEditPostId(null)}
        open={editPostId !== null}
      >
        <SheetContent
          className="sm:max-w-4xl lg:max-w-5xl"
          side="right"
          variant="inset"
        >
          <SheetHeader>
            <SheetTitle>Edit post</SheetTitle>
            <SheetDescription>
              Update the article content, publish state, and public-facing
              details.
            </SheetDescription>
          </SheetHeader>
          <SheetPanel className="max-w-none">
            {editPostId ? (
              <Suspense fallback={<BlogPostFormSkeleton />}>
                <EditBlogPostForm
                  key={editPostId}
                  onSuccess={() => setEditPostId(null)}
                  postId={editPostId}
                />
              </Suspense>
            ) : null}
          </SheetPanel>
        </SheetContent>
      </Sheet>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setDeletePostTarget(null);
          }
        }}
        open={deletePostTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletePostTarget
                ? `This will permanently delete "${deletePostTarget.title}".`
                : "This will permanently delete this blog post."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending || deletePostTarget === null}
              onClick={() => {
                if (deletePostTarget) {
                  deleteMutation.mutate({ postId: deletePostTarget.id });
                }
              }}
              variant="destructive"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BlogTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <div className="border-b bg-muted/30 px-4 py-3">
          <div className="grid grid-cols-6 gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="ml-auto h-4 w-12" />
          </div>
        </div>

        <div className="divide-y">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              className="grid grid-cols-6 items-center gap-4 px-4 py-4"
              key={index}
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <div className="ml-auto flex gap-2">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlogCardSkeleton() {
  return (
    <Card size="default">
      <AspectRatio ratio={16 / 10}>
        <Skeleton className="h-full w-full" />
      </AspectRatio>

      <CardHeader className="gap-3 pb-0">
        <Skeleton className="h-6 w-3/5" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-3 w-24" />
      </CardHeader>

      <CardContent className="flex-1 space-y-2 pt-0">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>

      <CardFooter className="justify-end gap-2 border-t bg-muted/20">
        <Skeleton className="size-9 rounded-md" />
        <Skeleton className="size-9 rounded-md" />
      </CardFooter>
    </Card>
  );
}

function BlogCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <BlogCardSkeleton key={index} />
      ))}
    </div>
  );
}

function BlogEmptyState() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileTextIcon />
        </EmptyMedia>
        <EmptyTitle>No blog posts yet</EmptyTitle>
        <EmptyDescription>
          Create your first post to start publishing to the public blog.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function BlogResults({
  columns,
  dataLoaded,
  onDelete,
  onEdit,
  onTablePaginationChange,
  onTableSortingChange,
  pageIndex,
  pageSize,
  posts,
  sorting,
  total,
  view,
}: {
  columns: ColumnDef<BlogPost, unknown>[];
  dataLoaded: boolean;
  onDelete: (postId: string) => void;
  onEdit: (postId: string) => void;
  onTablePaginationChange: (pagination: PaginationState) => void;
  onTableSortingChange: (sorting: SortingState) => void;
  pageIndex: number;
  pageSize: number;
  posts: BlogPost[];
  sorting: SortingState;
  total: number;
  view: "card" | "table";
}) {
  if (!dataLoaded) {
    return view === "table" ? <BlogTableSkeleton /> : <BlogCardsSkeleton />;
  }

  if (posts.length === 0) {
    return <BlogEmptyState />;
  }

  if (view === "table") {
    return (
      <DataTable
        columns={columns}
        data={posts}
        manualPagination
        manualSorting
        onPaginationChange={onTablePaginationChange}
        onSortingChange={onTableSortingChange}
        pageIndex={pageIndex}
        pageSize={pageSize}
        sorting={sorting}
        total={total}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard
          key={post.id}
          onDelete={() => onDelete(post.id)}
          onEdit={() => onEdit(post.id)}
          post={post}
        />
      ))}
    </div>
  );
}
