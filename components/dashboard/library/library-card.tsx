"use client";

import { Loader2Icon } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import type { RouterOutputs } from "@/packages/trpc/server/router";

type LibraryCourse = RouterOutputs["course"]["listLibrary"]["courses"][number];

const DIFFICULTY_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  beginner: "outline",
  intermediate: "secondary",
  advanced: "default",
  expert: "default",
};

interface LibraryCardProps {
  course: LibraryCourse;
  onEnroll: (courseId: string) => void;
  isEnrolling?: boolean;
}

export function LibraryCard({
  course,
  onEnroll,
  isEnrolling = false,
}: LibraryCardProps) {
  const progress =
    course.lessonCount > 0
      ? (course.completedLessonCount / course.lessonCount) * 100
      : 0;

  return (
    <Card className="flex flex-col overflow-hidden pt-0" size="default">
      <Link
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href={
          course.isEnrolled
            ? `/learn/course/${course.id}`
            : "/dashboard/library"
        }
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
            variant={DIFFICULTY_BADGE_VARIANT[course.difficulty] ?? "outline"}
          >
            {course.difficulty}
          </Badge>
        </div>
        <CardTitle className="line-clamp-1 font-semibold text-base">
          <Link
            href={
              course.isEnrolled
                ? `/learn/course/${course.id}`
                : "/dashboard/library"
            }
          >
            {course.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-muted-foreground text-sm">
          {course.description ?? "No description."}
        </p>
        {course.isEnrolled && (
          <div className="mt-3 space-y-1.5">
            <Progress value={progress} />
            <p className="text-muted-foreground text-xs">
              {course.completedLessonCount} of {course.lessonCount} lessons
              completed
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-2 border-t">
        {course.isEnrolled ? (
          <Button
            nativeButton={false}
            render={<Link href={`/learn/course/${course.id}`} />}
            size="sm"
          >
            Continue
          </Button>
        ) : (
          <Button
            disabled={isEnrolling}
            onClick={() => onEnroll(course.id)}
            size="sm"
          >
            {isEnrolling ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : null}
            Enroll
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
