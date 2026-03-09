import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const mockFaqs = [
  {
    id: "faq-1",
    question: "What experience level do I need to get started?",
    answer:
      "No prior cybersecurity experience is required. Our beginner courses start from the fundamentals and build up progressively. If you have basic IT knowledge (networking, operating systems), you're ready to begin. Each course clearly states its prerequisites and difficulty level.",
  },
  {
    id: "faq-2",
    question: "Do I get access to hands-on labs?",
    answer:
      "Yes. Every technical course includes browser-based lab environments that simulate real enterprise networks. You don't need to install anything — labs launch directly from your browser and provide a safe space to practice offensive and defensive techniques.",
  },
  {
    id: "faq-3",
    question: "Are the courses aligned with certification exams?",
    answer:
      "Our certification prep courses are mapped directly to official exam objectives. We cover CISSP, CompTIA Security+, CEH, OSCP, CCSP, and more. Each course includes practice exams that mirror the format and difficulty of the real certification.",
  },
  {
    id: "faq-4",
    question: "Can my organisation use Sycom for team training?",
    answer:
      "Absolutely. We offer organisation accounts with features like cohort management, progress tracking dashboards, custom learning paths, and due date management. Administrators can monitor team progress and generate compliance reports.",
  },
  {
    id: "faq-5",
    question: "How long do I have access to course materials?",
    answer:
      "Once enrolled, you have lifetime access to the course content. This includes all future updates to the material. We regularly refresh our courses to reflect the latest threats, tools, and exam changes.",
  },
  {
    id: "faq-6",
    question: "Is there a free plan or trial available?",
    answer:
      "Yes. You can create a free account and access selected courses and introductory modules at no cost. This lets you explore the platform and teaching style before committing to a full subscription.",
  },
];

export function Faq() {
  return (
    <section className="relative bg-background py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <span className="font-mono text-primary/60 text-xs uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="mt-3 font-bold text-3xl text-foreground sm:text-4xl">
            Common <span className="text-primary">questions</span>
          </h2>
        </div>

        <Accordion>
          {mockFaqs.map((faq) => (
            <AccordionItem key={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                <p>{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
