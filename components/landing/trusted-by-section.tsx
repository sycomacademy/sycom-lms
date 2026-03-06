import { partnerLogos } from "@/lib/mock-data";

export function TrustedBySection() {
  return (
    <section className="border-border border-y bg-muted/30 py-10">
      <div className="container mx-auto px-4">
        <p className="mb-8 text-center font-medium text-muted-foreground text-xs uppercase tracking-widest">
          Aligned with leading certification bodies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {partnerLogos.map((partner) => (
            <div className="flex items-center justify-center" key={partner.id}>
              <span className="font-semibold text-lg text-muted-foreground/60 tracking-tight transition-colors hover:text-muted-foreground">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
