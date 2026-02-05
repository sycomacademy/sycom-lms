"use client";

import { ChevronDown, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  {
    label: "Solutions",
    href: "/solutions",
    children: [
      { label: "Incident Response", href: "/solutions/incident-response" },
      { label: "Threat Intelligence", href: "/solutions/threat-intelligence" },
      { label: "Security Assessment", href: "/solutions/security-assessment" },
      { label: "Managed Security", href: "/solutions/managed-security" },
    ],
  },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "IT Consulting", href: "/services/it-consulting" },
      { label: "Cloud Security", href: "/services/cloud-security" },
      { label: "Compliance", href: "/services/compliance" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link className="flex items-center gap-2" href="/">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
            <span className="font-bold text-primary-foreground">SC</span>
          </div>
          <span className="font-bold text-foreground text-xl">SYCOM</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) =>
            item.children ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger className="flex items-center gap-1 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground">
                  {item.label}
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {item.children.map((child) => (
                    <DropdownMenuItem asChild key={child.label}>
                      <Link href={child.href}>{child.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                className="font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="hidden items-center gap-4 lg:flex">
          <a
            className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
            href="tel:+1234567890"
          >
            <Phone className="h-4 w-4" />
            <span>+1 (234) 567-890</span>
          </a>
          <Button>Schedule Consultation</Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={cn("lg:hidden", mobileMenuOpen ? "block" : "hidden")}>
        <div className="space-y-1 px-4 pb-4">
          {navItems.map((item) => (
            <div key={item.label}>
              <Link
                className="block py-2 font-medium text-base text-muted-foreground hover:text-foreground"
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="ml-4 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      className="block py-1 text-muted-foreground text-sm hover:text-foreground"
                      href={child.href}
                      key={child.label}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-4">
            <Button className="w-full">Schedule Consultation</Button>
          </div>
        </div>
      </div>
    </header>
  );
}
