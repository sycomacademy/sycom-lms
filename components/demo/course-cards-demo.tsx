"use client";

import { ClockIcon, StarIcon } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";

export function CourseCardsDemo() {
  const courses = [
    {
      title: "CompTIA Security+",
      description:
        "Master the fundamentals of cybersecurity and prepare for the Security+ certification exam.",
      category: "CompTIA",
      price: "£999.00",
      duration: "40h",
      rating: 4.8,
      progress: 65,
    },
    {
      title: "CISSP Masterclass",
      description:
        "The Official ISC2 CISSP CBK Training Masterclass. Advance your cybersecurity career.",
      category: "ISC2",
      price: "£3,459",
      duration: "80h",
      rating: 4.9,
      progress: 0,
    },
    {
      title: "CompTIA Network+",
      description:
        "Learn networking fundamentals and prepare for the Network+ certification.",
      category: "CompTIA",
      price: "£999.00",
      duration: "35h",
      rating: 4.7,
      progress: 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.title}>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <Badge className="mb-2" variant="outline">
                  {course.category}
                </Badge>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription className="mt-2">
                  {course.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <ClockIcon className="size-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <StarIcon className="size-4 fill-primary text-primary" />
                <span>{course.rating}</span>
              </div>
            </div>
            {course.progress > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <span className="font-semibold text-lg">{course.price}</span>
            <Button variant={course.progress > 0 ? "outline" : "default"}>
              {course.progress > 0 ? "Continue" : "Enroll"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
