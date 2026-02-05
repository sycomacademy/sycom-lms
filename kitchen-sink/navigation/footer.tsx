import { Facebook, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  solutions: [
    { label: "Incident Response", href: "/solutions/incident-response" },
    { label: "Threat Intelligence", href: "/solutions/threat-intelligence" },
    { label: "Security Assessment", href: "/solutions/security-assessment" },
    { label: "Managed Security", href: "/solutions/managed-security" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Team", href: "/team" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ],
  support: [
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
];

export function Footer() {
  return (
    <footer className="border-border border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link className="mb-4 flex items-center gap-2" href="/">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
                <span className="font-bold text-primary-foreground">SC</span>
              </div>
              <span className="font-bold text-foreground text-xl">SYCOM</span>
            </Link>
            <p className="mb-6 max-w-sm text-muted-foreground text-sm">
              Your trusted partner in IT solutions and cybersecurity. Protecting
              businesses with cutting-edge technology and expert guidance.
            </p>
            <div className="space-y-2">
              <p className="font-medium text-foreground text-sm">
                Subscribe to our newsletter
              </p>
              <form className="flex gap-2">
                <Input
                  className="max-w-[240px]"
                  placeholder="Enter your email"
                  type="email"
                />
                <Button size="sm" type="submit">
                  <Mail className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-foreground text-sm uppercase tracking-wider">
              Solutions
            </h3>
            <ul className="space-y-2">
              {footerLinks.solutions.map((link) => (
                <li key={link.label}>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-primary"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-foreground text-sm uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-primary"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-foreground text-sm uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-primary"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-border border-t pt-8 md:flex-row">
          <p className="text-muted-foreground text-sm">
            © 2024 SYCOM Solutions. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                aria-label={social.label}
                className="text-muted-foreground transition-colors hover:text-primary"
                href={social.href}
                key={social.label}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
