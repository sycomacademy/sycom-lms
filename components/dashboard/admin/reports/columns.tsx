"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ReportItem {
  id: string;
  type: "report" | "feedback";
  userId: string | null;
  email: string;
  subject: string | null;
  message: string;
  category: string | null;
  status: string | null;
  imageUrl: string | null;
  createdAt: Date;
}

interface ReportsColumnsProps {
  onStatusChange: (id: string, status: string) => void;
  onViewDetails: (item: ReportItem) => void;
}

export function createColumns({
  onStatusChange,
  onViewDetails,
}: ReportsColumnsProps): ColumnDef<ReportItem>[] {
  return [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as ReportItem["type"];
        return (
          <Badge variant={type === "report" ? "default" : "secondary"}>
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        if (!category) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <Badge className="capitalize" variant="outline">
            {category}
          </Badge>
        );
      },
    },
    {
      accessorKey: "subject",
      header: "Subject/Preview",
      cell: ({ row }) => {
        const subject = row.original.subject;
        const message = row.original.message;
        const display =
          subject ?? message.slice(0, 50) + (message.length > 50 ? "..." : "");
        return <div className="max-w-[300px] truncate">{display}</div>;
      },
    },
    {
      accessorKey: "email",
      header: "Submitted By",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const id = row.original.id;
        const type = row.original.type;

        if (type === "feedback") {
          return <span className="text-muted-foreground">-</span>;
        }

        const currentStatus = status ?? "pending";

        return (
          <Select
            onValueChange={(value) => onStatusChange(id, value as string)}
            value={currentStatus}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
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
      header: "Actions",
      cell: ({ row }) => (
        <Button
          onClick={() => onViewDetails(row.original)}
          size="sm"
          variant="ghost"
        >
          View Details
        </Button>
      ),
    },
  ];
}
