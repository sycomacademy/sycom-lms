"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import {
  AlertCircleIcon,
  EyeIcon,
  LightbulbIcon,
  MessageSquareIcon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { ReportDetailDialog } from "@/components/dashboard/admin/reports/report-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/packages/trpc/client";
import type { RouterOutputs } from "@/packages/trpc/server/router";

type ReportItem = RouterOutputs["admin"]["listReports"]["items"][number];

const STATUS_BADGE: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "outline",
  in_progress: "secondary",
  resolved: "default",
  closed: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const TYPE_FILTER_LABELS: Record<string, string> = {
  all: "All types",
  report: "Reports",
  feedback: "Feedback",
};

const STATUS_FILTER_LABELS: Record<string, string> = {
  all: "All statuses",
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  bug: <AlertCircleIcon className="size-3.5" />,
  feature: <LightbulbIcon className="size-3.5" />,
  complaint: <MessageSquareIcon className="size-3.5" />,
  other: <MessageSquareIcon className="size-3.5" />,
};

function makeColumns(
  onViewDetail: (id: string, type: "report" | "feedback") => void
): ColumnDef<ReportItem, unknown>[] {
  return [
    {
      accessorKey: "type",
      header: "Type",
      size: 110,
      enableSorting: false,
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant={type === "report" ? "secondary" : "outline"}>
            {type === "report" ? (
              TYPE_ICONS[row.original.category ?? "other"]
            ) : (
              <MessageSquareIcon className="size-3.5" />
            )}
            <span className="capitalize">{type}</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "email",
      header: "From",
      size: 200,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue("email")}</span>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject / Message",
      size: 280,
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;
        const text = item.subject ?? item.message;
        return (
          <span className="line-clamp-1 text-sm">
            {text.length > 60 ? `${text.slice(0, 60)}...` : text}
          </span>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      size: 110,
      enableSorting: false,
      cell: ({ row }) => {
        const category = row.original.category;
        if (!category) {
          return <span className="text-muted-foreground">-</span>;
        }
        return <span className="text-sm capitalize">{category}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.original.status;
        if (!status) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <Badge variant={STATUS_BADGE[status] ?? "outline"}>
            {STATUS_LABELS[status] ?? status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      size: 130,
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
        const item = row.original;
        return (
          <Button
            onClick={() => onViewDetail(item.id, item.type)}
            size="icon-xs"
            variant="ghost"
          >
            <EyeIcon className="size-4" />
            <span className="sr-only">View details</span>
          </Button>
        );
      },
    },
  ];
}

export function ReportsTable() {
  const trpc = useTRPC();
  const [, startTransition] = useTransition();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailType, setDetailType] = useState<"report" | "feedback">("report");
  const [detailOpen, setDetailOpen] = useState(false);

  const queryOptions = trpc.admin.listReports.queryOptions({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    type: filterType as "report" | "feedback" | "all",
    status: filterStatus as
      | "pending"
      | "in_progress"
      | "resolved"
      | "closed"
      | "all",
  });

  const { data } = useSuspenseQuery(queryOptions);

  const openDetail = (id: string, type: "report" | "feedback") => {
    setDetailId(id);
    setDetailType(type);
    setDetailOpen(true);
  };

  const columns = makeColumns(openDetail);

  const handleFilterTypeChange = (value: string) => {
    startTransition(() => {
      setFilterType(value);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    });
  };

  const handleFilterStatusChange = (value: string) => {
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

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center py-12">
  //       <Spinner className="size-5" />
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          onValueChange={(v) => {
            if (v) {
              handleFilterTypeChange(v);
            }
          }}
          value={filterType}
        >
          <SelectTrigger className="w-fit" size="sm">
            <SelectValue>
              {TYPE_FILTER_LABELS[filterType] ?? "All types"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="report">Reports</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(v) => {
            if (v) {
              handleFilterStatusChange(v);
            }
          }}
          value={filterStatus}
        >
          <SelectTrigger className="w-fit" size="sm">
            <SelectValue>
              {STATUS_FILTER_LABELS[filterStatus] ?? "All statuses"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        manualPagination
        onPaginationChange={handlePaginationChange}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        total={data?.total ?? 0}
      />

      {/* Detail dialog */}
      <ReportDetailDialog
        onOpenChange={setDetailOpen}
        open={detailOpen}
        reportId={detailId}
        reportType={detailType}
      />
    </div>
  );
}
