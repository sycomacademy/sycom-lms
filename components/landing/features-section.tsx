import {
  Award,
  FlaskConical,
  GraduationCap,
  RefreshCcw,
  Route,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { mockFeatures } from "@/lib/mock-data";

const ICON_MAP: Record<string, typeof Award> = {
  Award,
  FlaskConical,
  GraduationCap,
  Users,
  Route,
  RefreshCcw,
};

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28" id="features">
      <div className="container mx-auto px-4">
        <SectionLabel label="Platform Features" />
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl text-foreground md:text-4xl">
            Everything you need to succeed
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            From hands-on labs to certification prep, our platform equips you
            with the tools and knowledge to build a career in cybersecurity.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockFeatures.map((feature) => {
            const Icon = ICON_MAP[feature.icon] ?? Award;
            return (
              <Card
                className="transition-all hover:ring-primary/30"
                key={feature.id}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-base text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
