"use client";

import { Menu, Shield, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "@/components/layout/foresight-link";
import { Button } from "@/components/ui/button";
import { cn } from "@/packages/utils/cn";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "https://sycom.academy/contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 transition-all duration-300",
        scrolled
          ? "border-white/5 border-b bg-[oklch(0.1_0.005_285.823/0.9)] backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link className="flex items-center gap-2.5" href="/">
          <div className="flex size-8 items-center justify-center bg-brand">
            <Shield className="size-4 text-white" />
          </div>
          <span className="font-semibold text-lg text-white tracking-tight">
            Sycom<span className="text-brand">Academy</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              className="font-medium text-sm text-white/60 transition-colors hover:text-white"
              href={link.href}
              key={link.label}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            className="text-white/70 hover:bg-white/5 hover:text-white"
            nativeButton={false}
            render={<Link href="/sign-in" />}
            variant="ghost"
          >
            Sign In
          </Button>
          <Button
            className="bg-brand text-white hover:bg-brand/80"
            nativeButton={false}
            render={<Link href="/sign-up" />}
          >
            Get Started
          </Button>
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          type="button"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden border-white/5 border-t bg-[oklch(0.1_0.005_285.823/0.95)] backdrop-blur-xl md:hidden"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col gap-4 px-6 py-6">
              {navLinks.map((link) => (
                <a
                  className="font-medium text-sm text-white/70 transition-colors hover:text-white"
                  href={link.href}
                  key={link.label}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                <Button
                  className="w-full border-white/10 text-white hover:bg-white/5"
                  nativeButton={false}
                  render={<Link href="/sign-in" />}
                  variant="outline"
                >
                  Sign In
                </Button>
                <Button
                  className="w-full bg-brand text-white hover:bg-brand/80"
                  nativeButton={false}
                  render={<Link href="/sign-up" />}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
