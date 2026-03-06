import { SectionLabel } from "@/components/ui/section-label";
import { mockStats } from "@/lib/mock-data";

export function StatsSection() {
  return (
    <section className="border-border border-y bg-primary py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <SectionLabel
          className="mb-4 [&_span]:text-primary-foreground/60"
          label="By the numbers"
        />
        <h2 className="mb-12 text-center font-bold text-3xl text-primary-foreground md:text-4xl">
          Trusted by security professionals worldwide
        </h2>

        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {mockStats.map((stat) => (
            <div className="text-center" key={stat.id}>
              <p className="mb-1 font-bold text-4xl text-primary-foreground md:text-5xl">
                {stat.value}
              </p>
              <p className="mb-1 font-semibold text-primary-foreground text-sm">
                {stat.label}
              </p>
              <p className="text-primary-foreground/60 text-xs">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
