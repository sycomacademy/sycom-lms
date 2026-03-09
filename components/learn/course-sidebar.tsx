"use client";

import { CheckIcon, LockIcon } from "lucide-react";
import type { Route } from "next";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { Link } from "@/components/layout/foresight-link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { cn } from "@/packages/utils/cn";

type EnrolledCourse = RouterOutputs["enrollment"]["getEnrolledCourse"];

export function CourseSidebar({
  courseId,
  data,
  currentLessonId,
}: {
  courseId: string;
  data: EnrolledCourse;
  currentLessonId: string;
}) {
  const currentSectionId =
    data.sections.find((section) =>
      section.lessons.some((lesson) => lesson.id === currentLessonId)
    )?.id ?? null;

  let defaultOpenSectionIds: string[] = [];
  if (currentSectionId != null) {
    defaultOpenSectionIds = [currentSectionId];
  } else if (data.sections[0]?.id) {
    defaultOpenSectionIds = [data.sections[0].id];
  }

  return (
    <div className="flex h-dvh flex-col">
      <div className="border-border border-b px-4 py-4">
        <div className="min-w-0">
          <p className="truncate font-medium text-sm">{data.course.title}</p>
          <p className="mt-0.5 text-muted-foreground text-xs">
            {data.progress.completed} / {data.progress.total} lessons
          </p>
        </div>
        <div className="mt-4">
          <Progress value={data.progress.percent}>
            <ProgressLabel>Progress</ProgressLabel>
            <ProgressValue>
              {(_formattedValue, value) => `${value ?? 0}%`}
            </ProgressValue>
          </Progress>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        <Accordion
          className="w-full rounded-none border-0"
          defaultValue={defaultOpenSectionIds}
          multiple
        >
          {data.sections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="px-2 py-2 text-sm hover:no-underline">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate">{section.title}</span>
                  {section.lessons.length > 0 &&
                  section.lessons.every((l) => l.isCompleted) ? (
                    <CheckIcon className="size-4 shrink-0 text-primary" />
                  ) : null}
                </div>
              </AccordionTrigger>

              <AccordionContent className="bg-background text-sm">
                <div className="-mx-2 mt-2 space-y-1">
                  {section.lessons.map((lesson) => {
                    const isActive = lesson.id === currentLessonId;
                    const isLocked = lesson.isLocked === true;
                    const isCompleted = lesson.isCompleted === true;

                    if (isLocked) {
                      return (
                        <div
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-2 text-sm opacity-60",
                            isActive ? "bg-muted" : "hover:bg-muted/50"
                          )}
                          key={lesson.id}
                        >
                          <LockIcon className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{lesson.title}</span>
                        </div>
                      );
                    }

                    return (
                      <Button
                        className={cn(
                          "h-auto w-full justify-start rounded-md px-2 py-2 text-left",
                          isActive ? "bg-muted" : "hover:bg-muted/50"
                        )}
                        key={lesson.id}
                        nativeButton={false}
                        render={
                          <Link
                            href={
                              `/learn/${courseId}?lesson=${lesson.id}` as Route
                            }
                          />
                        }
                        variant="ghost"
                      >
                        {isCompleted ? (
                          <CheckIcon className="size-4 text-primary" />
                        ) : (
                          <span className="size-4" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </Button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
