"use client";

import { useQuery } from "@tanstack/react-query";
import { UserIcon, UsersIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/packages/trpc/client";
import { getInitials } from "@/packages/utils/string";

interface CoursePeopleDialogProps {
  courseId: string;
  courseTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CoursePeople = RouterOutputs["course"]["getInstructors"];
type CoCreator = CoursePeople["coCreators"][number];

function PersonRow({
  person,
  trailing,
}: {
  person: Pick<CoCreator, "email" | "image" | "name">;
  trailing?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
      <Avatar size="sm">
        <AvatarImage
          alt={person.name ?? person.email}
          src={person.image ?? undefined}
        />
        <AvatarFallback>
          {getInitials(person.name ?? person.email)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">
          {person.name ?? "Unnamed"}
        </p>
        <p className="truncate text-muted-foreground text-xs">{person.email}</p>
      </div>
      {trailing ? (
        <span className="shrink-0 text-muted-foreground text-xs">
          {trailing}
        </span>
      ) : null}
    </div>
  );
}

function SectionHeading({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground text-sm">
      {icon}
      {children}
    </h3>
  );
}

export function CoursePeopleDialog({
  courseId,
  courseTitle,
  open,
  onOpenChange,
}: CoursePeopleDialogProps) {
  const trpc = useTRPC();

  const { data, isPending } = useQuery({
    ...trpc.course.getInstructors.queryOptions({
      courseId,
    }),
    enabled: open && courseId !== null,
  });

  const coCreators = data?.coCreators ?? [];
  let content: ReactNode = null;

  if (isPending) {
    content = (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-8" />
      </div>
    );
  } else if (data) {
    content = (
      <div className="space-y-6">
        <section>
          <SectionHeading
            icon={<UserIcon className="size-4 text-muted-foreground" />}
          >
            Main instructor
          </SectionHeading>
          {data.mainInstructor ? (
            <PersonRow person={data.mainInstructor} />
          ) : (
            <p className="text-muted-foreground text-sm">
              No instructor assigned.
            </p>
          )}
        </section>

        <section>
          <SectionHeading
            icon={<UsersIcon className="size-4 text-muted-foreground" />}
          >
            Co-creators ({coCreators.length})
          </SectionHeading>
          {coCreators.length > 0 ? (
            <div className="flex flex-col gap-2">
              {coCreators.map((coCreator) => (
                <PersonRow key={coCreator.id} person={coCreator} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No co-creators added yet.
            </p>
          )}
        </section>
      </div>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Instructor & students</DialogTitle>
          <DialogDescription>{courseTitle}</DialogDescription>
        </DialogHeader>
        <DialogPanel>{content}</DialogPanel>
      </DialogContent>
    </Dialog>
  );
}
