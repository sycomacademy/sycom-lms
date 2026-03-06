import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import type { Route } from "next";
import { Link } from "@/components/layout/foresight-link";

import { ModeSwitcher } from "./mode-switcher";

const popularCourses = [
  { href: "/#courses", label: "Browse Courses" },
  { href: "/#courses", label: "Certification Prep" },
  { href: "/#courses", label: "Ethical Hacking" },
  { href: "/#courses", label: "Cloud Security" },
];

const recentPosts = [
  {
    href: "/blog/ai-powered-cyber-threats-2026",
    title: "The Rise of AI-Powered Cyber Threats",
    date: "28 Feb 2026",
  },
  {
    href: "/blog/zero-trust-architecture-implementation-guide",
    title: "Zero Trust Architecture Guide",
    date: "20 Feb 2026",
  },
  {
    href: "/blog/top-cybersecurity-certifications-2026",
    title: "Top Certifications for 2026",
    date: "14 Feb 2026",
  },
];

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-primary">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-semibold text-lg text-primary-foreground">
              About Sycom Academy
            </h3>
            <p className="font-sans text-primary-foreground/80 text-sm leading-relaxed">
              We are dedicated to providing unparalleled education and training
              to prepare individuals for the challenges and opportunities in the
              rapidly evolving field of cybersecurity.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-semibold text-lg text-primary-foreground">
              Popular Courses
            </h3>
            <nav className="flex flex-col gap-2.5">
              {popularCourses.map((course) => (
                <Link
                  className="block font-sans text-primary-foreground/80 text-sm transition-colors hover:text-primary-foreground"
                  href={course.href as Route}
                  key={course.label}
                >
                  {course.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-semibold text-lg text-primary-foreground">
              Recent Posts
            </h3>
            <nav className="flex flex-col gap-3">
              {recentPosts.map((post) => (
                <Link
                  className="group block"
                  href={post.href as Route}
                  key={post.title}
                >
                  <h4 className="font-sans text-primary-foreground text-sm transition-colors group-hover:text-primary-foreground/80">
                    {post.title}
                  </h4>
                  <time className="mt-1 block font-sans text-primary-foreground/60 text-xs">
                    {post.date}
                  </time>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-4">
            <h4 className="mb-3 font-sans font-semibold text-primary-foreground text-sm">
              Contact details
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary-foreground/80" />
                <span className="font-sans text-primary-foreground/80 text-sm">
                  2 Infirmary St, Leeds LS1 2JP, United Kingdom
                </span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="size-4 shrink-0 text-primary-foreground/80" />
                <a
                  className="font-sans text-primary-foreground/80 text-sm transition-colors hover:text-primary-foreground"
                  href="tel:+441133280244"
                >
                  +44-113-328-0244
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MailIcon className="size-4 shrink-0 text-primary-foreground/80" />
                <a
                  className="font-sans text-primary-foreground/80 text-sm transition-colors hover:text-primary-foreground"
                  href="mailto:info@sycom.academy"
                >
                  info@sycom.academy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-muted">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row sm:px-8">
          <p className="font-sans text-muted-foreground text-sm">
            © Copyright Sycom Solutions
          </p>
          <div className="flex items-center gap-4">
            <ModeSwitcher />
            <span className="font-sans text-muted-foreground text-sm">
              Call Center:
            </span>
            <a
              className="font-sans text-muted-foreground text-sm transition-colors hover:text-foreground"
              href="tel:+441133280244"
            >
              +44-113-328-0244
            </a>
            <div className="flex items-center gap-2">
              {/* {socialLinks.map((item) => (
                <a
                  aria-label={item.label}
                  className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted-foreground/10 hover:text-foreground"
                  href={item.href}
                  key={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <item.icon className="size-4" />
                </a>
              ))} */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
