"use client";

import { useQuery } from "@tanstack/react-query";
import { GraduationCapIcon, UserIcon, UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/packages/trpc/client";

interface CoursePeopleDialogProps {
  courseId: string | null;
  courseTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WORD_SPLIT = /\s+/;

function getInitials(name: string | null, email: string): string {
  if (name?.trim()) {
    return name
      .trim()
      .split(WORD_SPLIT)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  const part = email.split("@")[0];
  return part.length >= 2 ? part.slice(0, 2).toUpperCase() : part.toUpperCase();
}

export function CoursePeopleDialog({
  courseId,
  courseTitle,
  open,
  onOpenChange,
}: CoursePeopleDialogProps) {
  const trpc = useTRPC();

  const { data, isPending } = useQuery({
    ...trpc.course.getInstructorAndEnrollments.queryOptions({
      courseId: courseId ?? "",
    }),
    enabled: open && !!courseId,
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Instructor &amp; students</DialogTitle>
          <DialogDescription>{courseTitle}</DialogDescription>
        </DialogHeader>
        <DialogPanel>
          {isPending && (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-8" />
            </div>
          )}
          {!isPending && data && (
            <div className="space-y-6">
              <section>
                <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground text-sm">
                  <UserIcon className="size-4 text-muted-foreground" />
                  Main instructor (creator)
                </h3>
                {data.mainInstructor ? (
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                    <Avatar size="sm">
                      <AvatarImage
                        alt={
                          data.mainInstructor.name ?? data.mainInstructor.email
                        }
                        src={data.mainInstructor.image ?? undefined}
                      />
                      <AvatarFallback>
                        {getInitials(
                          data.mainInstructor.name,
                          data.mainInstructor.email
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {data.mainInstructor.name ?? "Unnamed"}
                      </p>
                      <p className="truncate text-muted-foreground text-xs">
                        {data.mainInstructor.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No instructor assigned.
                  </p>
                )}
              </section>

              <section>
                <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground text-sm">
                  <UsersIcon className="size-4 text-muted-foreground" />
                  Co-creators ({(data.coCreators ?? []).length})
                </h3>
                {(data.coCreators ?? []).length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {(data.coCreators ?? []).map((co) => (
                      <li
                        className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2"
                        key={co.id}
                      >
                        <Avatar size="sm">
                          <AvatarImage
                            alt={co.name ?? co.email}
                            src={co.image ?? undefined}
                          />
                          <AvatarFallback>
                            {getInitials(co.name, co.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-sm">
                            {co.name ?? "Unnamed"}
                          </p>
                          <p className="truncate text-muted-foreground text-xs">
                            {co.email}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No co-creators added yet.
                  </p>
                )}
              </section>

              <section>
                <h3 className="mb-2 flex items-center gap-2 font-medium text-foreground text-sm">
                  <GraduationCapIcon className="size-4 text-muted-foreground" />
                  Enrolled students ({data.enrolledStudents.length})
                </h3>
                {data.enrolledStudents.length > 0 ? (
                  <ScrollArea className="h-48 rounded-lg border">
                    <ul className="divide-y p-2">
                      {data.enrolledStudents.map((student) => (
                        <li
                          className="flex items-center gap-3 px-1 py-2"
                          key={student.id}
                        >
                          <Avatar size="sm">
                            <AvatarImage
                              alt={student.name ?? student.email}
                              src={student.image ?? undefined}
                            />
                            <AvatarFallback>
                              {getInitials(student.name, student.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-sm">
                              {student.name ?? "Unnamed"}
                            </p>
                            <p className="truncate text-muted-foreground text-xs">
                              {student.email}
                            </p>
                          </div>
                          <span className="shrink-0 text-muted-foreground text-xs">
                            {student.enrolledAt
                              ? new Date(student.enrolledAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                              : "—"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No students enrolled yet.
                  </p>
                )}
              </section>
            </div>
          )}
        </DialogPanel>
      </DialogContent>
    </Dialog>
  );
}
