"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, SearchIcon, Trash2Icon, UsersIcon } from "lucide-react";
import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { track } from "@/packages/analytics/client";
import { analyticsEvents } from "@/packages/analytics/events";
import { useTRPC } from "@/packages/trpc/client";
import { getInitials } from "@/packages/utils/string";

interface CoCreatorsModalProps {
  courseId: string;
}

function ListSkeleton({
  count,
  showAction,
}: {
  count: number;
  showAction?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div className="flex items-center gap-3 px-3 py-2" key={i}>
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
          {showAction && <Skeleton className="h-8 w-16 rounded-md" />}
        </div>
      ))}
    </div>
  );
}

function CoCreatorsContent({ courseId }: { courseId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: instructors, isLoading: isLoadingCoLeads } = useQuery(
    trpc.course.getInstructors.queryOptions({ courseId })
  );

  const { data: candidates, isLoading: isLoadingCandidates } = useQuery(
    trpc.course.searchCoLeadCandidates.queryOptions({ courseId, search })
  );

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.course.getInstructors.queryKey({ courseId }),
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
      onSuccess: (_data, variables) => {
        invalidate();
        track({
          event: analyticsEvents.courseCocreatorAdded,
          course_id: courseId,
          user_id: variables.userId,
        });
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
      onSuccess: (_data, variables) => {
        invalidate();
        track({
          event: analyticsEvents.courseCocreatorRemoved,
          course_id: courseId,
          user_id: variables.userId,
        });
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

  const renderCoLeads = () => {
    if (isLoadingCoLeads) {
      return <ListSkeleton count={2} />;
    }
    if (!instructors || instructors.coCreators.length === 0) {
      return (
        <p className="text-muted-foreground text-sm">
          No co-creators yet. Search below to add some.
        </p>
      );
    }
    return (
      <ul className="flex flex-col gap-2">
        {instructors.coCreators.map((co) => (
          <li
            className="flex items-center gap-3 rounded-md border px-3 py-2"
            key={co.id}
          >
            <Avatar size="sm">
              {co.image && <AvatarImage src={co.image} />}
              <AvatarFallback>{getInitials(co.name ?? "")}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{co.name}</p>
              <p className="truncate text-muted-foreground text-xs">
                {co.email}
              </p>
            </div>
            <Button
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate({ courseId, userId: co.id })}
              size="sm"
              title="Remove co-creator"
              type="button"
              variant="ghost"
            >
              {removeMutation.isPending ? (
                <Spinner className="size-3.5" />
              ) : (
                <Trash2Icon className="size-3.5 text-destructive" />
              )}
            </Button>
          </li>
        ))}
      </ul>
    );
  };

  const renderCandidates = () => {
    if (isLoadingCandidates) {
      return <ListSkeleton count={3} showAction />;
    }
    if (!candidates || candidates.length === 0) {
      return (
        <p className="text-muted-foreground text-sm">
          {search
            ? "No content creators found matching your search."
            : "No available content creators to add."}
        </p>
      );
    }
    return (
      <ul className="flex flex-col gap-2">
        {candidates.map((candidate) => (
          <li
            className="flex items-center gap-3 rounded-md border px-3 py-2"
            key={candidate.id}
          >
            <Avatar size="sm">
              {candidate.image && <AvatarImage src={candidate.image} />}
              <AvatarFallback>
                {getInitials(candidate.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{candidate.name}</p>
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
                <Spinner className="size-3.5" />
              ) : (
                <PlusIcon className="size-3.5" />
              )}
              Add
            </Button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Current co-creators
          {instructors ? ` (${instructors.coCreators.length})` : ""}
        </p>
        {renderCoLeads()}
      </div>

      <Separator />

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
        {renderCandidates()}
      </div>
    </div>
  );
}

export function CoCreatorsModal({ courseId }: CoCreatorsModalProps) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            className="border-input"
            size="sm"
            type="button"
            variant="outline"
          >
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
          <CoCreatorsContent courseId={courseId} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
