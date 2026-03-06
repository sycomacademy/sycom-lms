"use client";

import { ArrowRight, Clock, Star, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { mockCourses } from "@/lib/mock-data";

const difficultyColors: Record<string, string> = {
  beginner: "bg-success/10 text-success",
  intermediate: "bg-warning/10 text-warning",
  advanced: "bg-destructive/10 text-destructive",
};

export function CoursesSection() {
  return (
    <section className="bg-muted/30 py-20 lg:py-28" id="courses">
      <div className="container mx-auto px-4">
        <SectionLabel label="Popular Courses" />
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl text-foreground md:text-4xl">
            Start with the right course
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Explore our most popular courses, designed by industry experts and
            aligned with leading certification exams.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockCourses.map((course) => (
            <Card
              className="group/course flex flex-col transition-all hover:ring-primary/30"
              key={course.id}
            >
              <div className="aspect-video w-full bg-muted">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <span className="text-xs">{course.category}</span>
                </div>
              </div>

              <CardContent className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-0.5 font-medium text-xs ${difficultyColors[course.difficulty]}`}
                  >
                    {course.difficulty}
                  </span>
                  <Badge variant="secondary">{course.category}</Badge>
                </div>

                <h3 className="mb-2 font-semibold text-foreground leading-snug group-hover/course:text-primary">
                  {course.title}
                </h3>

                <p className="mb-4 flex-1 text-muted-foreground text-sm leading-relaxed">
                  {course.summary}
                </p>

                <div className="flex items-center gap-4 text-muted-foreground text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {course.estimatedDuration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course.studentsCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    {course.rating}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            className="gap-2"
            nativeButton={false}
            render={
              <Link href="/sign-up">
                View all courses
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
            size="lg"
            variant="outline"
          />
        </div>
      </div>
    </section>
  );
}
