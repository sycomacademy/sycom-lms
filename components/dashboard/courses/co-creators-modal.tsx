"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { Suspense, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { useTRPC } from "@/packages/trpc/client";

interface CoCreatorsModalProps {
  courseId: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function CoCreatorsContent({ courseId }: { courseId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: coLeads } = useSuspenseQuery(
    trpc.course.listCoLeads.queryOptions({ courseId })
  );

  const { data: candidates } = useSuspenseQuery(
    trpc.course.searchCoLeadCandidates.queryOptions({ courseId, search })
  );

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.course.listCoLeads.queryKey({ courseId }),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.course.searchCoLeadCandidates.queryKey({
        courseId,
        search,
      }),
    });
  };

  const addMutation = useMutation(
    trpc.course.addCoLead.mutationOptions({
      onSuccess: () => {
        invalidate();
        toastManager.add({ title: "Co-creator added", type: "success" });
      },
      onError: (err) => {
        toastManager.add({
          title: "Failed to add co-creator",
          description: err.message,
          type: "error",
        });
      },
    })
  );

  const removeMutation = useMutation(
    trpc.course.removeCoLead.mutationOptions({
      onSuccess: () => {
        invalidate();
        toastManager.add({ title: "Co-creator removed", type: "success" });
      },
      onError: (err) => {
        toastManager.add({
          title: "Failed to remove co-creator",
          description: err.message,
          type: "error",
        });
      },
    })
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Current co-creators */}
      <div>
        <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Current co-creators ({coLeads.length})
        </p>
        {coLeads.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No co-creators yet. Search below to add some.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {coLeads.map((co) => (
              <li
                className="flex items-center gap-3 rounded-md border px-3 py-2"
                key={co.userId}
              >
                <Avatar size="sm">
                  {co.image && <AvatarImage src={co.image} />}
                  <AvatarFallback>{initials(co.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{co.name}</p>
                  <p className="truncate text-muted-foreground text-xs">
                    {co.email}
                  </p>
                </div>
                <Button
                  disabled={removeMutation.isPending}
                  onClick={() =>
                    removeMutation.mutate({ courseId, userId: co.userId })
                  }
                  size="sm"
                  title="Remove co-creator"
                  type="button"
                  variant="ghost"
                >
                  {removeMutation.isPending ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2Icon className="size-3.5 text-destructive" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Separator />

      {/* Search candidates */}
      <div>
        <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Add co-creators
        </p>
        <div className="relative mb-3">
          <SearchIcon className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            value={search}
          />
        </div>
        {candidates.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {search
              ? "No content creators found matching your search."
              : "No available content creators to add."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {candidates.map((candidate) => (
              <li
                className="flex items-center gap-3 rounded-md border px-3 py-2"
                key={candidate.id}
              >
                <Avatar size="sm">
                  {candidate.image && <AvatarImage src={candidate.image} />}
                  <AvatarFallback>{initials(candidate.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">
                    {candidate.name}
                  </p>
                  <p className="truncate text-muted-foreground text-xs">
                    {candidate.email}
                  </p>
                </div>
                <Button
                  disabled={addMutation.isPending}
                  onClick={() =>
                    addMutation.mutate({ courseId, userId: candidate.id })
                  }
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {addMutation.isPending ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <PlusIcon className="size-3.5" />
                  )}
                  Add
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function CoCreatorsModal({ courseId }: CoCreatorsModalProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="sm" type="button" variant="outline">
            <UsersIcon className="size-4" />
            Co-creators
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Co-content creators</DialogTitle>
          <DialogDescription>
            Manage who can edit and contribute to this course. Only users with
            the content creator role can be added.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <Spinner className="size-5" />
              </div>
            }
          >
            <CoCreatorsContent courseId={courseId} />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
}
