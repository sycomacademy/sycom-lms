import { BugIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUserQuery } from "@/packages/hooks/use-user";

export function DebugInfo() {
  const data = useUserQuery();
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline">
            <BugIcon className="size-4" />
          </Button>
        }
      />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Debug Info</DialogTitle>
          <DialogDescription>Debug information</DialogDescription>
          <pre className="text-xs">
            {JSON.stringify(data.userAgent, null, 2)}
          </pre>
          <pre className="text-xs">
            {JSON.stringify(data.ipAddress, null, 2)}
          </pre>
          <pre className="text-xs">
            {JSON.stringify(data.isSignedIn, null, 2)}
          </pre>
          <pre className="text-xs">
            {JSON.stringify(data.timezone, null, 2)}
          </pre>
          <pre className="text-xs">
            {JSON.stringify(data.isPending, null, 2)}
          </pre>
          <pre className="text-xs">
            {JSON.stringify(data.isFetching, null, 2)}
          </pre>
          <pre className="text-xs">{JSON.stringify(data.profile, null, 2)}</pre>
          <pre className="text-xs">{JSON.stringify(data.session, null, 2)}</pre>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
