"use client";

import {
  BookOpenIcon,
  CheckIcon,
  ClockIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CourseDescriptionDemo() {
  const reviews = [
    {
      author: "Sarah Johnson",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Excellent course! The instructor explains complex concepts clearly. Highly recommend for anyone starting their cybersecurity journey.",
    },
    {
      author: "Michael Chen",
      rating: 5,
      date: "1 month ago",
      comment:
        "Comprehensive coverage of all Security+ topics. The labs were particularly helpful in understanding real-world scenarios.",
    },
    {
      author: "Emily Rodriguez",
      rating: 4,
      date: "2 months ago",
      comment:
        "Great course overall. Some sections could use more examples, but the material is solid and well-structured.",
    },
  ];

  const modules = [
    {
      title: "Introduction to Cybersecurity",
      duration: "2h 30m",
      lessons: [
        { title: "What is Cybersecurity?", duration: "25m", completed: true },
        {
          title: "Threat Landscape Overview",
          duration: "30m",
          completed: true,
        },
        { title: "Security Fundamentals", duration: "35m", completed: true },
        {
          title: "Security Models and Frameworks",
          duration: "40m",
          completed: true,
        },
        { title: "Introduction Quiz", duration: "20m", completed: true },
      ],
      completed: true,
    },
    {
      title: "Threats, Attacks, and Vulnerabilities",
      duration: "4h 15m",
      lessons: [
        {
          title: "Malware Types and Characteristics",
          duration: "45m",
          completed: true,
        },
        {
          title: "Social Engineering Attacks",
          duration: "50m",
          completed: true,
        },
        { title: "Network Attacks", duration: "55m", completed: true },
        { title: "Application Attacks", duration: "50m", completed: true },
        { title: "Vulnerability Assessment", duration: "45m", completed: true },
        { title: "Penetration Testing", duration: "50m", completed: false },
        { title: "Threat Intelligence", duration: "40m", completed: false },
        {
          title: "Threats and Attacks Quiz",
          duration: "20m",
          completed: false,
        },
      ],
      completed: true,
    },
    {
      title: "Architecture and Design",
      duration: "3h 45m",
      lessons: [
        {
          title: "Security Architecture Principles",
          duration: "40m",
          completed: false,
        },
        { title: "Secure Network Design", duration: "45m", completed: false },
        { title: "Cloud Security", duration: "50m", completed: false },
        {
          title: "Secure Application Development",
          duration: "45m",
          completed: false,
        },
        {
          title: "Cryptography Fundamentals",
          duration: "50m",
          completed: false,
        },
        { title: "Architecture Quiz", duration: "35m", completed: false },
      ],
      completed: false,
    },
    {
      title: "Identity and Access Management",
      duration: "3h 20m",
      lessons: [
        { title: "Authentication Methods", duration: "45m", completed: false },
        { title: "Authorization Models", duration: "40m", completed: false },
        { title: "Identity Management", duration: "50m", completed: false },
        { title: "Access Control", duration: "45m", completed: false },
        { title: "Federated Identity", duration: "40m", completed: false },
        { title: "IAM Best Practices", duration: "40m", completed: false },
        { title: "IAM Quiz", duration: "20m", completed: false },
      ],
      completed: false,
    },
    {
      title: "Risk Management",
      duration: "2h 50m",
      lessons: [
        { title: "Risk Assessment", duration: "45m", completed: false },
        {
          title: "Risk Mitigation Strategies",
          duration: "50m",
          completed: false,
        },
        { title: "Business Continuity", duration: "40m", completed: false },
        { title: "Disaster Recovery", duration: "35m", completed: false },
        { title: "Risk Management Quiz", duration: "40m", completed: false },
      ],
      completed: false,
    },
  ];

  const totalDuration = modules.reduce(
    (acc, m) =>
      acc + Number.parseFloat(m.duration.replace("h", ".").replace("m", "")),
    0
  );

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">CompTIA</Badge>
              <Badge>New</Badge>
            </div>
            <h1 className="font-semibold text-3xl">CompTIA Security+</h1>
            <p className="text-muted-foreground text-sm">
              Master the fundamentals of cybersecurity and prepare for the
              Security+ certification exam. This comprehensive course covers all
              domains required for the CompTIA Security+ SY0-701 exam.
            </p>
          </div>
          <Card className="w-80 shrink-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-2xl">£999.00</span>
                <div className="flex items-center gap-1">
                  <StarIcon className="size-4 fill-primary text-primary" />
                  <span className="font-medium text-sm">4.8</span>
                  <span className="text-muted-foreground text-xs">
                    (234 reviews)
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg">
                Enroll Now
              </Button>
              <Button className="w-full" size="lg" variant="outline">
                Add to Wishlist
              </Button>
              <Separator />
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <ClockIcon className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    ~{totalDuration.toFixed(1)} hours
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Lessons:</span>
                  <span className="font-medium">
                    {modules.reduce((acc, m) => acc + m.lessons.length, 0)}{" "}
                    lessons
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UsersIcon className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Students:</span>
                  <span className="font-medium">1,234 enrolled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6 space-y-6" value="overview">
          <Card>
            <CardHeader>
              <CardTitle>About This Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The CompTIA Security+ certification is a globally recognized
                credential that validates your baseline skills in cybersecurity.
                This course provides comprehensive coverage of all five domains
                tested on the Security+ SY0-701 exam.
              </p>
              <div>
                <h3 className="mb-2 font-semibold text-sm">
                  What You'll Learn
                </h3>
                <ul className="list-disc space-y-1 pl-6 text-muted-foreground text-sm">
                  <li>Threats, attacks, and vulnerabilities</li>
                  <li>Architecture and design principles</li>
                  <li>Implementation of secure systems</li>
                  <li>Operations and incident response</li>
                  <li>Governance, risk, and compliance</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h3 className="mb-2 font-semibold text-sm">Prerequisites</h3>
                <ul className="list-disc space-y-1 pl-6 text-muted-foreground text-sm">
                  <li>Basic understanding of computmer networks</li>
                  <li>Familiarity with Windows and Linux operating systems</li>
                  <li>Recommended: CompTIA Network+ or equivalent knowledge</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="mt-6" value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
              <CardDescription>
                {modules.length} modules •{" "}
                {modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion className="w-full" multiple>
                {modules.map((module, index) => (
                  <AccordionItem key={module.title} value={`module-${index}`}>
                    <AccordionTrigger className="px-4 py-3">
                      <div className="flex flex-1 items-center justify-between pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted font-medium text-muted-foreground text-xs">
                            {index + 1}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-sm">
                                {module.title}
                              </h3>
                              {module.completed && (
                                <Badge className="text-xs" variant="outline">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-muted-foreground text-xs">
                              <span className="flex items-center gap-1">
                                <ClockIcon className="size-3" />
                                {module.duration}
                              </span>
                              <span>{module.lessons.length} lessons</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 px-4 pb-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            className="flex items-center justify-between rounded-md border p-3"
                            key={lesson.title}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex size-6 shrink-0 items-center justify-center rounded border text-muted-foreground text-xs">
                                {lessonIndex + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {lesson.title}
                                  </span>
                                  {lesson.completed && (
                                    <CheckIcon className="size-4 text-primary" />
                                  )}
                                </div>
                                <span className="text-muted-foreground text-xs">
                                  {lesson.duration}
                                </span>
                              </div>
                            </div>
                            {lesson.completed && (
                              <Badge className="text-xs" variant="outline">
                                Completed
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="mt-6" value="reviews">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Reviews</CardTitle>
                  <CardDescription>
                    Average rating: 4.8 out of 5 (234 reviews)
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  Write a Review
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div className="space-y-2" key={review.author}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {review.author}
                        </span>
                        <div className="flex items-center gap-1">
                          {[...new Array(5)].map((_, i) => (
                            <StarIcon
                              className={`size-3 ${
                                i < review.rating
                                  ? "fill-primary text-primary"
                                  : "text-muted"
                              }`}
                              key={`star-${review.author}-${i}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {review.date}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {review.comment}
                    </p>
                    {review !== reviews.at(-1) && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="mt-6" value="instructor">
          <Card>
            <CardHeader>
              <CardTitle>About the Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  JD
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-sm">John Davis</h3>
                  <p className="text-muted-foreground text-xs">
                    Cybersecurity Expert • CISSP, CISM, Security+
                  </p>
                  <p className="text-muted-foreground text-sm">
                    John has over 15 years of experience in cybersecurity,
                    working with Fortune 500 companies and training thousands of
                    students. He holds multiple industry certifications and is
                    passionate about making cybersecurity accessible to
                    everyone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
