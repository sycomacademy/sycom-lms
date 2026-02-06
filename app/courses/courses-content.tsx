"use client";

import { ClockIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/ui/section-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string;
  level: string;
  price: number;
  duration: number;
  thumbnailUrl: string | null;
  rating: string;
  reviewCount: number;
}

const categories = ["All", "CompTIA", "ISC2"];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];

export function CoursesContent({ courses }: { courses: CourseRow[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchQuery === "" ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel =
      selectedLevel === "All" || course.level === selectedLevel.toLowerCase();

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <>
      {/* Page Header */}
      <section className="relative bg-muted py-16 lg:py-24">
        <div className="absolute inset-0 z-0">
          <Image
            alt=""
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src="/images/landscape.png"
          />
          <div className="absolute inset-0 bg-foreground/70" />
        </div>
        <div className="container relative z-10 mx-auto px-4 [&_.text-muted-foreground]:text-background/90">
          <SectionLabel label="Courses" />
          <h1 className="mb-4 font-bold text-4xl text-background md:text-5xl">
            Browse Courses
          </h1>
          <p className="max-w-2xl text-background/85 text-lg">
            Explore our comprehensive cybersecurity courses designed to advance
            your career and prepare you for industry-recognized certifications.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <Input
                className="max-w-md"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                value={searchQuery}
              />
            </div>
            <div className="flex items-center gap-4">
              <Select
                onValueChange={(value) => setSelectedCategory(value ?? "All")}
                value={selectedCategory}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(value) => setSelectedLevel(value ?? "All")}
                value={selectedLevel}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {filteredCourses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">
                No courses found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <Card key={course.id}>
                  <div className="relative aspect-video bg-secondary">
                    {course.thumbnailUrl ? (
                      <Image
                        alt={course.title}
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={course.thumbnailUrl}
                      />
                    ) : null}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Badge className="mb-2" variant="outline">
                          {course.category}
                        </Badge>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {course.shortDescription}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="size-4" />
                        <span>{Math.round(course.duration / 60)}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <StarIcon className="size-4 fill-primary text-primary" />
                        <span>{course.rating}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        ({course.reviewCount} reviews)
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <span className="font-semibold text-lg">
                      £{(course.price / 100).toFixed(2)}
                    </span>
                    <Button
                      nativeButton={false}
                      render={
                        <Link href={`/courses/${course.slug}`}>
                          View Course
                        </Link>
                      }
                      variant="default"
                    >
                      View Course
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
