import { ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  {
    number: "01",
    title: "Incident Response",
    description:
      "Rapid response to security incidents with 24/7 availability. Our expert team contains threats, minimizes damage, and restores operations quickly.",
  },
  {
    number: "02",
    title: "Threat Intelligence",
    description:
      "Stay ahead of attackers with real-time threat monitoring and intelligence. We identify vulnerabilities before they can be exploited.",
  },
  {
    number: "03",
    title: "Security Assessment",
    description:
      "Comprehensive security audits and penetration testing to identify weaknesses in your infrastructure, applications, and processes.",
  },
  {
    number: "04",
    title: "Compliance Management",
    description:
      "Navigate complex regulatory requirements with expert guidance on GDPR, HIPAA, SOC 2, PCI-DSS, and other compliance frameworks.",
  },
];

export function NumberedServices() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <p className="mb-2 font-medium text-primary text-sm uppercase tracking-widest">
            Our Services
          </p>
          <h2 className="font-bold text-3xl text-foreground md:text-4xl">
            Comprehensive Security Solutions
          </h2>
        </div>
        <div className="space-y-8">
          {services.map((service, index) => (
            <div
              className="group flex flex-col gap-4 border-border border-b pb-8 last:border-0 md:flex-row md:items-start md:gap-8"
              key={service.number}
            >
              <span className="font-bold text-5xl text-primary/20 transition-colors group-hover:text-primary/40">
                {service.number}
              </span>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-foreground text-xl">
                  {service.title}
                </h3>
                <p className="mb-4 text-muted-foreground">
                  {service.description}
                </p>
                <Link
                  className="inline-flex items-center gap-2 font-medium text-primary text-sm transition-colors hover:text-primary/80"
                  href={`/services/${service.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
