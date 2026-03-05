"use client";

import { PencilIcon, Trash2Icon, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
import type { RouterOutputs } from "@/packages/trpc/server/router";

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

export function CourseCard({
  course,
  onDelete,
  onViewPeople,
}: CourseCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden pt-0" size="default">
      <Link
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={`/dashboard/courses/${course.id}/edit`}
      >
        <AspectRatio ratio={16 / 9}>
          {course.imageUrl ? (
            <Image
              alt={course.title}
              className="h-full w-full object-cover"
              height={180}
              src={course.imageUrl}
              width={320}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs">
              No image
            </div>
          )}
        </AspectRatio>
      </Link>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {course.categories.map((cat) => (
            <Badge key={cat.id} variant="secondary">
              {cat.name}
            </Badge>
          ))}
          <Badge
            className="capitalize"
            variant={STATUS_BADGE_VARIANT[course.status] ?? "outline"}
          >
            {course.status}
          </Badge>
          <Badge
            className="capitalize"
            variant={DIFFICULTY_BADGE_VARIANT[course.difficulty] ?? "outline"}
          >
            {course.difficulty}
          </Badge>
        </div>
        <CardTitle className="line-clamp-1 font-semibold text-base">
          <Link href={`/dashboard/courses/${course.id}/edit`}>
            {course.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-muted-foreground text-sm">
          {course.description ?? "No description."}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-end gap-2 border-t">
        {onViewPeople && (
          <Button
            onClick={onViewPeople}
            size="sm"
            title="Instructor & students"
            variant="outline"
          >
            <UsersIcon className="size-3.5" />
            People
          </Button>
        )}
        <Button
          onClick={() => onDelete?.(course.id)}
          size="sm"
          variant="destructive"
        >
          <Trash2Icon className="size-3.5" />
          Delete
        </Button>
        <Button
          nativeButton={false}
          render={<Link href={`/dashboard/courses/${course.id}/edit`} />}
          size="sm"
          variant="outline"
        >
          <PencilIcon className="size-3.5" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
