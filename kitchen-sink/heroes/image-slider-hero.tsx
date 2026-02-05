"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    title: "Master Cybersecurity Skills",
    subtitle: "Industry-Leading Training Programs",
    description:
      "Get certified with CompTIA, ISC2, and other recognized credentials",
    cta: "Browse Courses",
  },
  {
    title: "Hands-On Learning Experience",
    subtitle: "Real-World Scenarios",
    description:
      "Practice in simulated environments with expert instructor guidance",
    cta: "Start Learning",
  },
  {
    title: "Advance Your Career",
    subtitle: "Join 5000+ Certified Professionals",
    description:
      "Transform your career with in-demand cybersecurity certifications",
    cta: "Get Started",
  },
];

export function ImageSliderHero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <section className="relative h-[600px] overflow-hidden bg-background lg:h-[700px]">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />

      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            className={cn(
              "absolute inset-0 flex items-center transition-opacity duration-700",
              index === currentSlide
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            )}
            key={slide.title}
          >
            <div className="container mx-auto px-4">
              <div className="max-w-2xl">
                <p className="mb-2 font-medium text-primary text-sm uppercase tracking-widest">
                  {slide.subtitle}
                </p>
                <h1 className="mb-4 font-bold text-4xl text-foreground md:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>
                <p className="mb-8 text-lg text-muted-foreground">
                  {slide.description}
                </p>
                <Button size="lg">{slide.cta}</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        aria-label="Previous slide"
        className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-background/10 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background/20"
        onClick={prevSlide}
        type="button"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        aria-label="Next slide"
        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-background/10 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background/20"
        onClick={nextSlide}
        type="button"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            aria-label={`Go to slide ${index + 1}`}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              index === currentSlide
                ? "w-8 bg-primary"
                : "bg-foreground/30 hover:bg-foreground/50"
            )}
            key={slide.title}
            onClick={() => goToSlide(index)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}
