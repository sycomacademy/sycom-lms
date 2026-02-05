import { BookOpenIcon, ClockIcon, StarIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
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
import { SectionLabel } from "@/components/ui/section-label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { courses, instructors } from "@/mock-db";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return courses.map((course) => ({
    slug: course.slug,
  }));
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = courses.find((c) => c.slug === slug);

  if (!course) {
    notFound();
  }

  const instructor = instructors.find((i) => i.id === course.instructorId);
  const totalLessons = course.modules.reduce(
    (acc, module) =>
      acc +
      module.sections.reduce(
        (acc2, section) => acc2 + section.lessons.length,
        0
      ),
    0
  );

  return (
    <>
      <Header />
      <main>
        {/* Course Hero */}
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
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
              <div className="flex-1 space-y-4 text-background">
                <div className="flex items-center gap-2">
                  <Badge
                    className="border-background/50 text-background"
                    variant="outline"
                  >
                    {course.category}
                  </Badge>
                  <Badge className="border-background/50 bg-background/20 text-background">
                    {course.level}
                  </Badge>
                </div>
                <h1 className="font-bold text-4xl md:text-5xl">
                  {course.title}
                </h1>
                <p className="max-w-3xl text-background/85 text-lg">
                  {course.description}
                </p>
              </div>
              <Card className="w-full shrink-0 text-foreground lg:w-80">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-2xl">
                      £{(course.price / 100).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                      <StarIcon className="size-4 fill-primary text-primary" />
                      <span className="font-medium text-sm">
                        {course.rating}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        ({course.reviewCount} reviews)
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
                        {Math.round(course.duration / 60)} hours
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpenIcon className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Lessons:</span>
                      <span className="font-medium">
                        {totalLessons} lessons
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UsersIcon className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Students:</span>
                      <span className="font-medium">
                        {course.enrolledCount.toLocaleString()} enrolled
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Course Content Tabs */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
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
                      {course.description}
                    </p>
                    <div>
                      <h3 className="mb-2 font-semibold text-sm">
                        What You'll Learn
                      </h3>
                      <ul className="list-disc space-y-1 pl-6 text-muted-foreground text-sm">
                        {course.whatYoullLearn.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="mb-2 font-semibold text-sm">
                        Prerequisites
                      </h3>
                      <ul className="list-disc space-y-1 pl-6 text-muted-foreground text-sm">
                        {course.prerequisites.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="mb-2 font-semibold text-sm">
                        Who This Course Is For
                      </h3>
                      <ul className="list-disc space-y-1 pl-6 text-muted-foreground text-sm">
                        {course.whoIsThisFor.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="mb-2 font-semibold text-sm">
                        Course Highlights
                      </h3>
                      <ul className="list-disc space-y-1 pl-6 text-muted-foreground text-sm">
                        {course.highlights.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
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
                      {course.modules.length} modules • {totalLessons} lessons
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {course.modules.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        Curriculum coming soon.
                      </p>
                    ) : (
                      <Accordion className="w-full">
                        {course.modules.map((module, index) => (
                          <AccordionItem
                            key={module.id}
                            value={`module-${index}`}
                          >
                            <AccordionTrigger className="px-4 py-3">
                              <div className="flex flex-1 items-center justify-between pr-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted font-medium text-muted-foreground text-xs">
                                    {index + 1}
                                  </div>
                                  <div className="text-left">
                                    <h3 className="font-medium text-sm">
                                      {module.title}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-4 text-muted-foreground text-xs">
                                      <span className="flex items-center gap-1">
                                        <ClockIcon className="size-3" />
                                        {module.sections.reduce(
                                          (acc, section) =>
                                            acc +
                                            section.lessons.reduce(
                                              (acc2, lesson) =>
                                                acc2 + lesson.duration,
                                              0
                                            ),
                                          0
                                        )}{" "}
                                        min
                                      </span>
                                      <span>
                                        {module.sections.reduce(
                                          (acc, section) =>
                                            acc + section.lessons.length,
                                          0
                                        )}{" "}
                                        lessons
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 px-4 pb-2">
                                {module.sections.map((section) =>
                                  section.lessons.map((lesson, lessonIndex) => (
                                    <div
                                      className="flex items-center justify-between rounded-md border p-3"
                                      key={lesson.id}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex size-6 shrink-0 items-center justify-center rounded border text-muted-foreground text-xs">
                                          {lessonIndex + 1}
                                        </div>
                                        <div>
                                          <span className="font-medium text-sm">
                                            {lesson.title}
                                          </span>
                                          <span className="ml-2 text-muted-foreground text-xs">
                                            ({lesson.type})
                                          </span>
                                          <div>
                                            <span className="text-muted-foreground text-xs">
                                              {lesson.duration} min
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
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
                          Average rating: {course.rating} out of 5 (
                          {course.reviewCount} reviews)
                        </CardDescription>
                      </div>
                      <Button size="sm" variant="outline">
                        Write a Review
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {course.reviews.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No reviews yet. Be the first to review this course!
                      </p>
                    ) : (
                      <div className="space-y-6">
                        {course.reviews.map((review) => (
                          <div className="space-y-2" key={review.id}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {review.userName}
                                </span>
                                <div className="flex items-center gap-1">
                                  {[...new Array(5)].map((_, i) => (
                                    <StarIcon
                                      className={`size-3 ${
                                        i < review.rating
                                          ? "fill-primary text-primary"
                                          : "text-muted"
                                      }`}
                                      key={`star-${review.id}-${i}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-muted-foreground text-xs">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {review.comment}
                            </p>
                            {review !== course.reviews.at(-1) && <Separator />}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent className="mt-6" value="instructor">
                {instructor ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>About the Instructor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4">
                        {instructor.photoUrl ? (
                          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                            <Image
                              alt={instructor.name}
                              className="size-16 rounded-full object-cover"
                              height={64}
                              src={instructor.photoUrl}
                              width={64}
                            />
                          </div>
                        ) : (
                          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                            {instructor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold text-sm">
                            {instructor.name}
                          </h3>
                          <p className="text-muted-foreground text-xs">
                            {instructor.credentials.join(" • ")} •{" "}
                            {instructor.experience}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {instructor.bio}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground text-sm">
                        Instructor information not available.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
