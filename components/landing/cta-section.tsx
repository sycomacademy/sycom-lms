"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import FadeContent from "@/components/reactbits/fade-content";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="container relative mx-auto px-4">
        <FadeContent blur duration={800}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 font-bold text-3xl text-foreground md:text-4xl lg:text-5xl">
              Ready to start your cybersecurity journey?
            </h2>
            <p className="mx-auto mb-12 max-w-xl text-lg text-muted-foreground">
              Join thousands of professionals who are building their security
              skills with Sycom. Create a free account and start learning today.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                className="gap-2"
                nativeButton={false}
                render={
                  <Link href="/sign-up">
                    Create free account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
                size="lg"
              />
              <Button
                nativeButton={false}
                render={<Link href="#courses">Explore courses</Link>}
                size="lg"
                variant="outline"
              />
            </div>
          </div>
        </FadeContent>
      </div>
    </section>
  );
}
