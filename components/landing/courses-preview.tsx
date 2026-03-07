"use client";

import { ArrowRight, BookOpen, Clock, Star, Users } from "lucide-react";
import { motion } from "motion/react";
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
import { mockCourses } from "@/packages/utils/mock-data";

const difficultyColor = {
  beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function CoursesPreview() {
  const featured = mockCourses.slice(0, 3);

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
            render={<Link href="/dashboard/courses" />}
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
                <Card className="h-full pt-0 transition-colors hover:ring-primary/20">
                  <div className="relative h-44 overflow-hidden bg-linear-to-br from-primary/10 to-primary/5">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="font-mono text-6xl text-primary/10">
                        {course.category
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={`border ${difficultyColor[course.difficulty]}`}
                      >
                        {course.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="flex flex-1 flex-col">
                    <span className="mb-2 font-mono text-primary/50 text-xs uppercase tracking-wider">
                      {course.category}
                    </span>
                    <h3 className="mb-2 font-semibold text-lg leading-snug">
                      {course.title}
                    </h3>
                    <p className="line-clamp-2 flex-1 text-muted-foreground text-sm">
                      {course.summary}
                    </p>
                  </CardContent>

                  <CardFooter className="text-muted-foreground text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {course.estimatedDuration}
                    </span>
                    <span className="ml-4 flex items-center gap-1">
                      <BookOpen className="size-3" />
                      {course.lessonsCount} lessons
                    </span>
                    <span className="ml-4 flex items-center gap-1">
                      <Users className="size-3" />
                      {course.studentsCount.toLocaleString()}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-amber-400">
                      <Star className="size-3 fill-current" />
                      {course.rating}
                    </span>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
