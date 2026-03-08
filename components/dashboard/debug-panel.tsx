"use client";
import { BugIcon } from "lucide-react";
import { type JsonValue, JsonViewer } from "@/components/elements/json-viewer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserQuery } from "@/packages/hooks/use-user";

export function DebugInfo() {
  const data = useUserQuery();
  const jsonSafeData = JSON.parse(JSON.stringify(data)) as JsonValue;
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="icon" variant="ghost">
            <BugIcon />
          </Button>
        }
      />
      <DialogContent className="flex max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Debug Info</DialogTitle>
          <DialogDescription>Debug information</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full min-h-0 p-4">
            <JsonViewer data={jsonSafeData} />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
