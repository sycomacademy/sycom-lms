import { BookOpen, Compass, Trophy } from "lucide-react";
import { SectionLabel } from "@/components/ui/section-label";
import { mockSteps } from "@/lib/mock-data";

const ICON_MAP: Record<string, typeof Compass> = {
  Compass,
  BookOpen,
  Trophy,
};

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <SectionLabel label="How It Works" />
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-bold text-3xl text-foreground md:text-4xl">
            Your path to cybersecurity expertise
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A structured approach that takes you from fundamentals to
            certification, with hands-on practice at every step.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-3 md:gap-8">
          {mockSteps.map((item, index) => {
            const Icon = ICON_MAP[item.icon] ?? Compass;
            return (
              <div className="relative text-center" key={item.id}>
                {index < mockSteps.length - 1 && (
                  <div className="absolute top-10 left-1/2 hidden h-px w-full bg-border md:block" />
                )}

                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-primary/10">
                  <Icon className="h-8 w-8 text-primary" />
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center bg-primary font-bold text-primary-foreground text-xs">
                    {item.step}
                  </span>
                </div>

                <h3 className="mb-3 font-semibold text-foreground text-lg">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
