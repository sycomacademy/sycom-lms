"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EnrollmentItem {
  enrollment: {
    id: string;
    progress: number;
  };
  course: {
    slug: string;
    title: string;
    category: string;
    level: string;
    thumbnailUrl: string | null;
  };
}

export function EnrollmentsList({
  enrollments,
}: {
  enrollments: EnrollmentItem[];
}) {
  const [hideCompleted, setHideCompleted] = useState(false);

  const filtered = hideCompleted
    ? enrollments.filter((e) => e.enrollment.progress < 100)
    : enrollments;

  const hasCompleted = enrollments.some((e) => e.enrollment.progress === 100);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-lg">Continue Learning</h2>
        <div className="flex items-center gap-3">
          {hasCompleted && (
            <Button
              onClick={() => setHideCompleted((v) => !v)}
              size="sm"
              variant="ghost"
            >
              {hideCompleted ? (
                <EyeIcon className="mr-1.5 size-4" />
              ) : (
                <EyeOffIcon className="mr-1.5 size-4" />
              )}
              {hideCompleted ? "Show completed" : "Hide completed"}
            </Button>
          )}
          {enrollments.length > 0 && (
            <Button
              nativeButton={false}
              render={<Link href="/courses" />}
              size="sm"
              variant="ghost"
            >
              Browse courses
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 && hideCompleted ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12">
            <p className="font-medium">All caught up!</p>
            <p className="text-muted-foreground text-sm">
              You&apos;ve completed all your enrolled courses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ enrollment: enr, course: c }) => (
            <Card className="group overflow-hidden" key={enr.id}>
              <div className="relative aspect-video bg-secondary">
                {c.thumbnailUrl ? (
                  <Image
                    alt={c.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={c.thumbnailUrl}
                  />
                ) : null}
                {enr.progress === 100 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Badge variant="default">Completed</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{c.category}</Badge>
                  <Badge variant="secondary">{c.level}</Badge>
                </div>
                <h3 className="mb-1 font-semibold text-sm transition-colors group-hover:text-primary">
                  <Link href={`/courses/${c.slug}`}>{c.title}</Link>
                </h3>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-muted-foreground text-xs">
                    <span>Progress</span>
                    <span>{enr.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${enr.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
