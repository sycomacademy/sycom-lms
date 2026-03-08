"use client";

import { InfoIcon, PencilIcon, Trash2Icon } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
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

interface CourseCardProps {
  course: Course;
  onDelete?: (courseId: string) => void;
  onViewPeople?: () => void;
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
    <Card size="default">
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
        <CardTitle className="line-clamp-1 font-semibold text-base">
          <Link href={editHref}>{course.title}</Link>
        </CardTitle>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="capitalize">{course.difficulty}</Badge>
          <Badge className="capitalize" variant="outline">
            {course.status}
          </Badge>
        </div>
        {categoriesLabel ? (
          <p className="truncate text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
            {categoriesLabel}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
            Uncategorized
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        <p className="line-clamp-3 text-muted-foreground text-sm leading-6">
          {course.description ?? "No description."}
        </p>
      </CardContent>

      <CardFooter className="items-center justify-between gap-3 border-t bg-muted/20">
        <div className="flex items-center gap-2">
          {onViewPeople ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    onClick={onViewPeople}
                    size="icon-sm"
                    variant="outline"
                  >
                    <InfoIcon className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>Instructor & students</TooltipContent>
            </Tooltip>
          ) : (
            <span />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={() => onDelete?.(course.id)}
                  size="icon-sm"
                  variant="destructive"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Delete course</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
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
            <TooltipContent>Edit course</TooltipContent>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  );
}
