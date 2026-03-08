"use client";

import { InfoIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import type { ReactElement } from "react";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { Link } from "@/components/layout/foresight-link";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Course = RouterOutputs["course"]["list"]["courses"][number];

const DIFFICULTY_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  beginner: "outline",
  intermediate: "secondary",
  advanced: "default",
  expert: "default",
};

const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  draft: "outline",
  published: "default",
};

interface CourseCardProps {
  course: Course;
  onDelete?: (courseId: string) => void;
  onViewPeople?: () => void;
}

function IconAction({
  tooltip,
  trigger,
}: {
  tooltip: string;
  trigger: ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function CourseCard({
  course,
  onDelete,
  onViewPeople,
}: CourseCardProps) {
  const categoriesLabel =
    course.categories.length > 0
      ? course.categories.map((category) => category.name).join(", ")
      : null;
  const editHref = `/dashboard/courses/${course.id}/edit` as Route;

  return (
    <Card
      className="overflow-hidden border border-border/70 bg-card pt-0 shadow-sm"
      size="default"
    >
      <Link
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={editHref}
      >
        <AspectRatio ratio={16 / 10}>
          {course.imageUrl ? (
            <Image
              alt={course.title}
              className="h-full w-full object-cover"
              height={220}
              src={course.imageUrl}
              width={360}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs uppercase tracking-[0.2em]">
              No image
            </div>
          )}
        </AspectRatio>
      </Link>

      <CardHeader className="gap-3 pb-0">
        {categoriesLabel ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <p className="truncate text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
                  {categoriesLabel}
                </p>
              }
            />
            <TooltipContent>{categoriesLabel}</TooltipContent>
          </Tooltip>
        ) : (
          <p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
            Uncategorized
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            className="capitalize"
            variant={DIFFICULTY_BADGE_VARIANT[course.difficulty] ?? "outline"}
          >
            {course.difficulty}
          </Badge>
          <Badge
            className="capitalize"
            variant={STATUS_BADGE_VARIANT[course.status] ?? "outline"}
          >
            {course.status}
          </Badge>
        </div>

        <CardTitle className="line-clamp-1 font-semibold text-base">
          <Link href={editHref}>{course.title}</Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        <p className="line-clamp-3 text-muted-foreground text-sm leading-6">
          {course.description ?? "No description."}
        </p>
      </CardContent>

      <CardFooter className="items-center justify-between gap-3 border-t bg-muted/20">
        <div className="flex items-center gap-2">
          {onViewPeople ? (
            <IconAction
              tooltip="Instructor & students"
              trigger={
                <Button onClick={onViewPeople} size="icon-sm" variant="outline">
                  <InfoIcon className="size-4" />
                </Button>
              }
            />
          ) : (
            <span />
          )}
        </div>

        <div className="flex items-center gap-2">
          <IconAction
            tooltip="Delete course"
            trigger={
              <Button
                onClick={() => onDelete?.(course.id)}
                size="icon-sm"
                variant="destructive"
              >
                <Trash2Icon className="size-4" />
              </Button>
            }
          />
          <IconAction
            tooltip="Edit course"
            trigger={
              <Button
                nativeButton={false}
                render={<Link href={editHref} />}
                size="icon-sm"
                variant="outline"
              >
                <PencilIcon className="size-4" />
              </Button>
            }
          />
        </div>
      </CardFooter>
    </Card>
  );
}
