"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavSection {
  title: string;
  items: { id: string; label: string }[];
}

const navigation: NavSection[] = [
  {
    title: "Design Tokens",
    items: [
      { id: "colors", label: "Colors" },
      { id: "typography", label: "Typography" },
      { id: "spacing", label: "Spacing" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { id: "header", label: "Header" },
      { id: "footer", label: "Footer" },
    ],
  },
  {
    title: "Heroes",
    items: [
      { id: "animated-hero", label: "Animated Text Hero" },
      { id: "slider-hero", label: "Image Slider Hero" },
      { id: "simple-hero", label: "Simple Hero" },
    ],
  },
  {
    title: "Cards",
    items: [
      { id: "service-cards", label: "Service Cards" },
      { id: "certification-cards", label: "Certification Cards" },
      { id: "testimonial-cards", label: "Testimonial Cards" },
      { id: "blog-cards", label: "Blog Cards" },
      { id: "feature-cards", label: "Feature Cards" },
      { id: "stats-cards", label: "Stats Cards" },
    ],
  },
  {
    title: "Sections",
    items: [
      { id: "numbered-services", label: "Numbered Services" },
      { id: "solutions-list", label: "Solutions List" },
      { id: "values-grid", label: "Values Grid" },
      { id: "stats-bar", label: "Stats Bar" },
      { id: "partner-logos", label: "Partner Logos" },
      { id: "affiliations", label: "Affiliations" },
      { id: "newsletter", label: "Newsletter" },
      { id: "team-cta", label: "Team CTA" },
      { id: "course-info", label: "Course Info" },
    ],
  },
  {
    title: "Forms",
    items: [
      { id: "contact-form", label: "Contact Form" },
      { id: "auth-forms", label: "Login/Register" },
    ],
  },
  {
    title: "UI Elements",
    items: [
      { id: "buttons", label: "Buttons" },
      { id: "social-links", label: "Social Links" },
      { id: "section-labels", label: "Section Labels" },
      { id: "slide-panel", label: "Slide Panel" },
    ],
  },
];

interface KitchenSinkSidebarProps {
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export function KitchenSinkSidebar({
  activeSection,
  onSectionChange,
}: KitchenSinkSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(
    navigation.map((n) => n.title)
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleNavClick = (id: string) => {
    onSectionChange(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <nav className="space-y-1">
      {navigation.map((section) => (
        <div key={section.title}>
          <button
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-semibold text-foreground text-sm hover:bg-secondary"
            onClick={() => toggleSection(section.title)}
            type="button"
          >
            {section.title}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                expandedSections.includes(section.title) && "rotate-180"
              )}
            />
          </button>
          {expandedSections.includes(section.title) && (
            <div className="ml-3 space-y-1 border-border border-l pl-3">
              {section.items.map((item) => (
                <button
                  className={cn(
                    "block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          onClick={() => setMobileOpen(!mobileOpen)}
          size="icon"
          variant="outline"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-72 border-border border-r bg-card p-4 transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-6 pt-12">
          <h2 className="font-bold text-foreground text-lg">
            Component Kitchen Sink
          </h2>
          <p className="text-muted-foreground text-sm">SYCOM Design System</p>
        </div>
        <div className="h-[calc(100vh-120px)] overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 hidden h-full w-64 border-border border-r bg-card p-4 lg:block">
        <div className="mb-6">
          <h2 className="font-bold text-foreground text-lg">
            Component Kitchen Sink
          </h2>
          <p className="text-muted-foreground text-sm">SYCOM Design System</p>
        </div>
        <div className="h-[calc(100vh-100px)] overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
