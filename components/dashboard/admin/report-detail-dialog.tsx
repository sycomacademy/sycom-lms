"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";
import type { RouterOutputs } from "@/packages/trpc/server/router";

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

interface ReportDetailDialogProps {
  reportId: string | null;
  reportType: "report" | "feedback";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getMessageContent(
  detail: RouterOutputs["admin"]["getReport"],
  isReport: boolean
): string {
  if (isReport && "description" in detail) {
    return detail.description;
  }
  if ("message" in detail) {
    return detail.message;
  }
  return "";
}

function ReportMetaGrid({
  detail,
  isReport,
}: {
  detail: RouterOutputs["admin"]["getReport"];
  isReport: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <span className="text-muted-foreground text-xs">From</span>
        <p className="font-medium">{detail.email as string}</p>
      </div>
      <div>
        <span className="text-muted-foreground text-xs">Date</span>
        <p className="font-medium">
          {new Date(detail.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>
      {isReport && detail.type === "report" && (
        <>
          <div>
            <span className="text-muted-foreground text-xs">Category</span>
            <p className="font-medium capitalize">{detail.type ?? "N/A"}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Status</span>
            <div className="mt-0.5">
              {detail.status ? (
                <Badge
                  variant={STATUS_BADGE[detail.status as string] ?? "outline"}
                >
                  {STATUS_LABELS[detail.status as string] ??
                    (detail.status as string)}
                </Badge>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ReportDetailDialog({
  reportId,
  reportType,
  open,
  onOpenChange,
}: ReportDetailDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: detail, isLoading } = useQuery({
    ...trpc.admin.getReport.queryOptions({ id: reportId ?? "" }),
    enabled: !!reportId && open,
  });

  const updateStatusMutation = useMutation(
    trpc.admin.updateReportStatus.mutationOptions({
      onSuccess: () => {
        toastManager.add({ title: "Status updated", type: "success" });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.listReports.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getReport.queryKey(),
        });
      },
      onError: (error) => {
        toastManager.add({
          title: "Failed to update status",
          description: error.message,
          type: "error",
        });
      },
    })
  );

  const isReport = reportType === "report";
  console.log();

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isReport ? "Report" : "Feedback"} details</DialogTitle>
          <DialogDescription>
            {isReport
              ? "View report details and update its status."
              : "View feedback details."}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          {isLoading || !detail ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-5" />
            </div>
          ) : (
            <ReportDetailContent detail={detail} isReport={isReport} />
          )}
        </DialogPanel>

        {/* Status change for reports */}
        {isReport && detail && "status" in detail && detail.status && (
          <DialogFooter>
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-muted-foreground text-xs">
                Update status
              </span>
              <Select
                onValueChange={(value) => {
                  if (value && reportId) {
                    updateStatusMutation.mutate({
                      id: reportId,
                      status: value as
                        | "pending"
                        | "in_progress"
                        | "resolved"
                        | "closed",
                    });
                  }
                }}
                value={detail.status as string}
              >
                <SelectTrigger className="w-fit" size="sm">
                  {updateStatusMutation.isPending ? (
                    <Spinner />
                  ) : (
                    <SelectValue>
                      {STATUS_LABELS[detail.status as string] ??
                        (detail.status as string)}
                    </SelectValue>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReportDetailContent({
  detail,
  isReport,
}: {
  detail: RouterOutputs["admin"]["getReport"];
  isReport: boolean;
}) {
  return (
    <div className="space-y-4">
      <ReportMetaGrid detail={detail} isReport={isReport} />

      {/* Subject */}
      {isReport && "subject" in detail && detail.subject ? (
        <div>
          <span className="text-muted-foreground text-xs">Subject</span>
          <p className="font-medium text-sm">{String(detail.subject)}</p>
        </div>
      ) : null}

      {/* Message / Description */}
      <div>
        <span className="text-muted-foreground text-xs">
          {isReport ? "Description" : "Message"}
        </span>
        <p className="mt-1 whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">
          {String(getMessageContent(detail, isReport))}
        </p>
      </div>

      {/* Image */}
      {isReport && "imageUrl" in detail && !!detail.imageUrl && (
        <div>
          <span className="text-muted-foreground text-xs">Attachment</span>
          <a
            className="mt-1 flex items-center gap-1 text-primary text-sm underline underline-offset-4"
            href={detail.imageUrl as string}
            rel="noopener noreferrer"
            target="_blank"
          >
            View attachment
            <ExternalLinkIcon className="size-3" />
          </a>
        </div>
      )}
    </div>
  );
}
