import { Award, FlaskConical, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ICON_MAP: Record<string, typeof Award> = {
  Award,
  FlaskConical,
  Users,
};

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string | null;
}

interface FeatureCardsProps {
  features: Feature[];
}

export function FeatureCards({ features }: FeatureCardsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => {
        const Icon =
          feature.icon && ICON_MAP[feature.icon]
            ? ICON_MAP[feature.icon]
            : Award;
        return (
          <Card
            className="text-center transition-all hover:border-primary/50"
            key={feature.id}
          >
            <CardContent className="p-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground text-lg">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
