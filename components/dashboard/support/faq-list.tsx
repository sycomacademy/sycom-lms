"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How do I enroll in a course?",
    answer:
      "To enroll in a course, navigate to the Courses section from your dashboard, browse or search for the course you're interested in, and click the 'Enroll' button. Some courses may require approval or payment before you can access the content.",
  },
  {
    question: "How do I track my learning progress?",
    answer:
      "Your learning progress is automatically tracked as you complete lessons and modules. Visit the Journey section to see your overall progress, completed courses, and achievements. You can also view detailed progress for each course you're enrolled in.",
  },
  {
    question: "Can I download course materials for offline use?",
    answer:
      "Some courses may offer downloadable materials such as PDFs, slides, or resources. Look for the download icon next to supported materials. Note that video content typically requires an internet connection to stream.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "To reset your password, go to Settings > Security and click 'Change Password'. You'll need to enter your current password and then set a new one. If you've forgotten your password, use the 'Forgot Password' link on the sign-in page.",
  },
  {
    question: "How do I update my profile information?",
    answer:
      "You can update your profile information by going to Settings > General. There you can change your name, email, profile picture, and bio. Some changes may require email verification.",
  },
  {
    question: "What should I do if a course video won't play?",
    answer:
      "If you're having trouble playing videos, try refreshing the page, clearing your browser cache, or switching to a different browser. Make sure you have a stable internet connection. If the issue persists, please submit a bug report through the Report tab.",
  },
  {
    question: "How do I get a certificate for completing a course?",
    answer:
      "Certificates are automatically generated when you complete all required modules in a course that offers certification. You can find and download your certificates from the Journey section under 'Achievements'.",
  },
  {
    question: "Can I request a refund for a paid course?",
    answer:
      "Refund policies vary by course. Generally, you may request a refund within 14 days of purchase if you haven't completed more than 20% of the course content. Please contact us through the Contact Us tab for refund requests.",
  },
];

export function FaqList() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium text-foreground text-sm">
              Frequently Asked Questions
            </h3>
            <p className="text-muted-foreground text-xs">
              Find answers to common questions about using the platform.
            </p>
          </div>
          <div className="mt-4">
            <Accordion>
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
