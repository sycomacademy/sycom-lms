"use client";

import { format } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import type { ReportItem } from "./columns";

interface ReportDetailsDialogProps {
  item: ReportItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "resolved":
      return "default";
    case "closed":
      return "secondary";
    case "in_progress":
      return "outline";
    default:
      return "destructive";
  }
}

export function ReportDetailsDialog({
  item,
  open,
  onOpenChange,
}: ReportDetailsDialogProps) {
  if (!item) {
    return null;
  }

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Badge variant={item.type === "report" ? "default" : "secondary"}>
              {item.type}
            </Badge>
            {item.type === "report" ? item.subject : "Feedback"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Submitted by {item.email} on{" "}
            {format(new Date(item.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {item.category && (
            <div>
              <span className="text-muted-foreground text-sm">Category:</span>
              <Badge className="ml-2 capitalize" variant="outline">
                {item.category}
              </Badge>
            </div>
          )}

          {item.status && (
            <div>
              <span className="text-muted-foreground text-sm">Status:</span>
              <Badge
                className="ml-2 capitalize"
                variant={getStatusVariant(item.status)}
              >
                {item.status.replace("_", " ")}
              </Badge>
            </div>
          )}

          <div>
            <span className="text-muted-foreground text-sm">Message:</span>
            <div className="mt-2 whitespace-pre-wrap rounded border bg-muted/50 p-4">
              {item.message}
            </div>
          </div>

          {item.imageUrl && (
            <div>
              <span className="text-muted-foreground text-sm">Attachment:</span>
              <div className="mt-2">
                <a
                  className="text-primary hover:underline"
                  href={item.imageUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  View Image
                </a>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel size="sm" variant="outline">
            Close
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onOpenChange(false)} size="sm">
            Done
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
