import { partnerLogos } from "@/lib/mock-data";

export function TrustedBySection() {
  return (
    <section className="border-border/50 border-y bg-muted/20 py-8">
      <div className="container mx-auto px-4">
        <p className="mb-6 text-center text-muted-foreground/60 text-xs uppercase tracking-widest">
          Aligned with leading certification bodies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {partnerLogos.map((partner) => (
            <span
              className="cursor-default font-semibold text-base text-muted-foreground/40 tracking-tight transition-colors duration-300 hover:text-foreground"
              key={partner.id}
            >
              {partner.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
