"use client";

import { CheckIcon, ClockIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export function AccordionDemo() {
  const faqItems = [
    {
      question: "What is included in this course?",
      answer:
        "This course includes video lectures, hands-on labs, practice quizzes, downloadable resources, and a certificate of completion upon finishing all modules.",
    },
    {
      question: "How long do I have access to the course?",
      answer:
        "Once enrolled, you have lifetime access to the course materials. You can learn at your own pace and revisit the content anytime.",
    },
    {
      question: "Do I need any prerequisites?",
      answer:
        "Basic understanding of computer networks and operating systems is recommended. No prior cybersecurity experience is required.",
    },
    {
      question: "Is there a certificate provided?",
      answer:
        "Yes, you'll receive a certificate of completion after finishing all course modules and passing the final assessment.",
    },
  ];

  const courseModules = [
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
        { title: "Security Fundamentals", duration: "35m", completed: false },
      ],
    },
    {
      title: "Network Security",
      duration: "3h 15m",
      lessons: [
        { title: "Network Protocols", duration: "45m", completed: false },
        { title: "Firewall Configuration", duration: "50m", completed: false },
        { title: "Intrusion Detection", duration: "40m", completed: false },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Basic Accordion</h3>
        <Accordion className="w-full" defaultValue={["item-1"]}>
          <AccordionItem value="item-1">
            <AccordionTrigger>First section</AccordionTrigger>
            <AccordionContent>
              Content for the first accordion panel. This can contain any
              content you need to display.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Second section</AccordionTrigger>
            <AccordionContent>
              Content for the second accordion panel. By default, only one item
              is open at a time.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Third section</AccordionTrigger>
            <AccordionContent>
              Content for the third accordion panel. Accordions are great for
              organizing related content.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm">FAQ Accordion</h3>
        <Accordion className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground text-sm">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm">Course Curriculum Accordion</h3>
        <Accordion className="w-full">
          {courseModules.map((module, index) => (
            <AccordionItem key={module.title} value={`module-${index}`}>
              <AccordionTrigger className="px-4 py-3">
                <div className="flex flex-1 items-center justify-between pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted font-medium text-muted-foreground text-xs">
                      {index + 1}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-sm">{module.title}</h3>
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
      </div>
    </div>
  );
}
