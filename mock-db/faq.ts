export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const faqs: FAQ[] = [
  {
    id: "1",
    question: "What certifications do you offer?",
    answer:
      "We offer preparation courses for various industry-recognized certifications including CompTIA Security+, Network+, PenTest+, ISC2 Certified in Cybersecurity (CC), CISSP, and more. Our courses are designed to help you pass these certification exams.",
    category: "Certifications",
  },
  {
    id: "2",
    question: "Do I need prior experience to start?",
    answer:
      "No prior experience is required for our beginner-level courses. We have pathways designed for complete beginners, as well as intermediate and advanced courses for experienced professionals. Each course clearly indicates its prerequisites.",
    category: "Getting Started",
  },
  {
    id: "3",
    question: "How long do I have access to course materials?",
    answer:
      "Once enrolled, you have lifetime access to course materials, including any updates. This means you can review content at your own pace and return to materials whenever you need a refresher.",
    category: "Access",
  },
  {
    id: "4",
    question: "Are the courses self-paced or scheduled?",
    answer:
      "All our courses are self-paced, allowing you to learn on your own schedule. You can complete courses as quickly or slowly as you need, fitting your learning around your work and personal commitments.",
    category: "Learning Format",
  },
  {
    id: "5",
    question: "What support is available if I have questions?",
    answer:
      "We provide multiple support channels including course forums where you can ask questions and interact with instructors and other students. Our support team is also available to help with technical issues or course-related questions.",
    category: "Support",
  },
  {
    id: "6",
    question: "Do you offer hands-on practice?",
    answer:
      "Yes! Our courses include interactive labs and hands-on exercises that allow you to practice skills in a safe, virtual environment. These labs simulate real-world scenarios you'll encounter in your cybersecurity career.",
    category: "Learning Format",
  },
  {
    id: "7",
    question: "Can I get a refund if I'm not satisfied?",
    answer:
      "We offer a 30-day money-back guarantee. If you're not satisfied with your course within the first 30 days, you can request a full refund, no questions asked.",
    category: "Pricing",
  },
  {
    id: "8",
    question: "How do pathways differ from individual courses?",
    answer:
      "Pathways are structured learning journeys that combine multiple courses in a logical sequence. They're designed to take you from beginner to certified professional, often including multiple certifications. Individual courses focus on specific topics or certifications.",
    category: "Courses",
  },
];
