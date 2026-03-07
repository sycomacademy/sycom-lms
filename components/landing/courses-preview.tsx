"use client";

import { ArrowRight, BookOpen, Clock, Star, Users } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "@/components/layout/foresight-link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockCourses } from "@/packages/utils/mock-data";

const difficultyColor = {
  beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function CoursesPreview() {
  const featured = mockCourses.slice(0, 3);

  return (
    <section className="relative bg-[oklch(0.08_0.005_285.823)] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div>
            <span className="font-mono text-brand/60 text-xs uppercase tracking-widest">
              Popular Courses
            </span>
            <h2 className="mt-3 font-bold text-3xl text-white sm:text-4xl">
              Start with our <span className="text-brand">top-rated</span>{" "}
              courses
            </h2>
          </div>
          <Button
            className="border-white/10 text-white hover:border-white/20 hover:bg-white/5"
            nativeButton={false}
            render={<Link href="/dashboard/courses" />}
            variant="outline"
          >
            View All Courses
            <ArrowRight className="ml-1 size-3.5" data-icon="inline-end" />
          </Button>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((course, i) => (
            <motion.div
              className="group relative flex flex-col border border-white/5 bg-[oklch(0.1_0.005_285.823)] transition-colors hover:border-brand/20"
              initial={{ opacity: 0, y: 24 }}
              key={course.id}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {/* Course image placeholder */}
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-brand/10 to-brand/5">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="font-mono text-6xl text-brand/10">
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

              <div className="flex flex-1 flex-col p-6">
                <span className="mb-2 font-mono text-brand/50 text-xs uppercase tracking-wider">
                  {course.category}
                </span>
                <h3 className="mb-2 font-semibold text-lg text-white leading-snug">
                  {course.title}
                </h3>
                <p className="mb-4 line-clamp-2 flex-1 text-sm text-white/40">
                  {course.summary}
                </p>

                <div className="flex items-center gap-4 border-white/5 border-t pt-4 text-white/30 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {course.estimatedDuration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="size-3" />
                    {course.lessonsCount} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {course.studentsCount.toLocaleString()}
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-amber-400">
                    <Star className="size-3 fill-current" />
                    {course.rating}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
