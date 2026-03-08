"use client";

import { ArrowRight, BookOpen, Clock, Users } from "lucide-react";
import { motion } from "motion/react";
import type { Route } from "next";
import Image from "next/image";
import type { RouterOutputs } from "@/app/api/trpc/router";
import { Link } from "@/components/layout/foresight-link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type PublicCourse = RouterOutputs["course"]["listPublic"]["courses"][number];

export function CoursesPreview({ courses }: { courses: PublicCourse[] }) {
  const featured = courses.slice(0, 3);

  return (
    <section className="relative bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div>
            <span className="font-mono text-primary/60 text-xs uppercase tracking-widest">
              Popular Courses
            </span>
            <h2 className="mt-3 font-bold text-3xl text-foreground sm:text-4xl">
              Start with our <span className="text-primary">top-rated</span>{" "}
              courses
            </h2>
          </div>
          <Button
            nativeButton={false}
            render={<Link href={"/courses" as Route} />}
            variant="outline"
          >
            View All Courses
            <ArrowRight className="ml-1 size-3.5" data-icon="inline-end" />
          </Button>
        </motion.div>

        {featured.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen />
              </EmptyMedia>
              <EmptyTitle>No courses available</EmptyTitle>
              <EmptyDescription>
                Courses will appear here once they are published. Check back
                soon for new learning opportunities.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((course, i) => (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                key={course.id}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Link href={`/courses/${course.slug ?? course.id}` as Route}>
                  <Card className="h-full pt-0 transition-colors hover:ring-primary/20">
                    <div className="relative h-44 overflow-hidden bg-linear-to-br from-primary/10 to-primary/5">
                      {course.imageUrl ? (
                        <Image
                          alt={course.title}
                          className="object-cover"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          src={course.imageUrl}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="font-mono text-6xl text-primary/10">
                            {course.title
                              .split(" ")
                              .slice(0, 3)
                              .map((w) => w[0])
                              .join("")}
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className="capitalize" variant="secondary">
                          {course.difficulty}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="flex flex-1 flex-col">
                      <h3 className="mb-2 font-semibold text-lg leading-snug">
                        {course.title}
                      </h3>
                      <p className="line-clamp-2 flex-1 text-muted-foreground text-sm">
                        {course.description ?? "No description."}
                      </p>
                    </CardContent>

                    <CardFooter className="text-muted-foreground text-xs">
                      {course.estimatedDuration ? (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {Math.round(course.estimatedDuration / 60)}h
                        </span>
                      ) : null}
                      <span className="ml-4 flex items-center gap-1">
                        <BookOpen className="size-3" />
                        {course.lessonCount} lessons
                      </span>
                      <span className="ml-4 flex items-center gap-1">
                        <Users className="size-3" />
                        {course.enrollmentCount.toLocaleString()}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
