"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/packages/utils/cn";

export function ScrollToTopDemo() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative min-h-[400px]">
      <div className="container mx-auto px-4 py-12">
        <p className="mb-4 text-muted-foreground">
          Scroll down to see the scroll-to-top button appear.
        </p>
        <div className="space-y-4">
          {Array.from({ length: 20 }, (_, i) => {
            const id = `section-${i}`;
            return (
              <div
                className="rounded-lg border border-border bg-card p-4"
                key={id}
              >
                <p className="text-muted-foreground">
                  Content section {i + 1} - Keep scrolling...
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <Button
        aria-label="Scroll to top"
        className={cn(
          "fixed right-6 bottom-6 z-50 h-10 w-10 rounded-full shadow-lg transition-all duration-300",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
        )}
        onClick={scrollToTop}
        size="icon"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
