import type { Metadata } from "next";
import { BusinessCta } from "@/components/landing/business-cta";
import { BusinessFeatures } from "@/components/landing/business-features";
import { BusinessHero } from "@/components/landing/business-hero";
import { BusinessStats } from "@/components/landing/business-stats";
import { BusinessTestimonials } from "@/components/landing/business-testimonials";
import { BusinessWhyUs } from "@/components/landing/business-why-us";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Enterprise Cybersecurity Training | SYCOM Academy",
  description:
    "Train your team with industry-leading cybersecurity courses. Custom learning paths, compliance training, and hands-on labs for organizations of all sizes.",
};

export default function BusinessPage() {
  return (
    <div>
      <Header />
      <BusinessHero />
      <BusinessStats />
      <BusinessFeatures />
      <BusinessWhyUs />
      <BusinessTestimonials />
      <BusinessCta />
      <Footer />
    </div>
  );
}
