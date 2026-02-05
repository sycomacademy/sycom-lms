import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TeamCTA() {
  return (
    <section className="bg-card py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-2xl text-foreground md:text-3xl">
                Ready to Join Our Team?
              </h2>
              <p className="text-muted-foreground">
                We&apos;re always looking for talented security professionals.
              </p>
            </div>
          </div>
          <Button className="gap-2" size="lg">
            View Open Positions
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
