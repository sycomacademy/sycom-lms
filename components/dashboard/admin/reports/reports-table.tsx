"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/packages/trpc/client";
import { DataTable } from "../users/data-table";
import { createColumns, type ReportItem } from "./columns";
import { ReportDetailsDialog } from "./report-details-dialog";

export function ReportsTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState<"all" | "report" | "feedback">(
    "all"
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "in_progress" | "resolved" | "closed"
  >("all");
  const [selectedItem, setSelectedItem] = useState<ReportItem | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data } = useSuspenseQuery(
    trpc.admin.listReports.queryOptions({
      limit: pageSize,
      offset: page * pageSize,
      type: typeFilter,
      status: statusFilter,
    })
  );

  const updateStatusMutation = useMutation(
    trpc.admin.updateReportStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [["admin", "listReports"]] });
      },
    })
  );

  const totalPages = Math.ceil((data?.total ?? 0) / pageSize);

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({
      id,
      status: status as "pending" | "in_progress" | "resolved" | "closed",
    });
  };

  const handleViewDetails = (item: ReportItem) => {
    setSelectedItem(item);
    setShowDetailsDialog(true);
  };

  const columns = createColumns({
    onStatusChange: handleStatusChange,
    onViewDetails: handleViewDetails,
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Select
          onValueChange={(value) => {
            setTypeFilter(value as "all" | "report" | "feedback");
            setPage(0);
          }}
          value={typeFilter}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="report">Reports</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => {
            setStatusFilter(
              value as "all" | "pending" | "in_progress" | "resolved" | "closed"
            );
            setPage(0);
          }}
          value={statusFilter}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={(data?.items ?? []) as ReportItem[]} />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Showing {page * pageSize + 1} to{" "}
          {Math.min((page + 1) * pageSize, data?.total ?? 0)} of{" "}
          {data?.total ?? 0} items
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

      {/* Details Dialog */}
      <ReportDetailsDialog
        item={selectedItem}
        onOpenChange={setShowDetailsDialog}
        open={showDetailsDialog}
      />
    </div>
  );
}
