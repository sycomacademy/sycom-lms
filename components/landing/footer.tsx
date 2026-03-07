import { Shield } from "lucide-react";
import { Link } from "@/components/layout/foresight-link";

const footerLinks = {
  Platform: [
    { label: "Courses", href: "/courses" },
    { label: "Labs", href: "/labs" },
    { label: "Pricing", href: "/pricing" },
    { label: "For Teams", href: "/teams" },
  ],
  Certifications: [
    { label: "CompTIA Security+", href: "/certifications/security-plus" },
    { label: "CISSP", href: "/certifications/cissp" },
    { label: "CEH", href: "/certifications/ceh" },
    { label: "OSCP", href: "/certifications/oscp" },
  ],
  Company: [
    { label: "About", href: "https://sycomsolutions.com/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "https://sycomsolutions.com/careers" },
    { label: "Contact", href: "https://sycom.academy/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-white/5 border-t bg-[oklch(0.06_0.005_285.823)]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link className="mb-4 flex items-center gap-2.5" href="/">
              <div className="flex size-8 items-center justify-center bg-brand">
                <Shield className="size-4 text-white" />
              </div>
              <span className="font-semibold text-lg text-white tracking-tight">
                Sycom<span className="text-brand">Academy</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/30 leading-relaxed">
              Industry-leading cybersecurity training built by Sycom Solutions.
              13+ years of protecting organizations.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 font-mono font-semibold text-white/50 text-xs uppercase tracking-widest">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      className="text-sm text-white/30 transition-colors hover:text-white"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-white/5 border-t pt-8 sm:flex-row">
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} Sycom Solutions. All rights
            reserved.
          </p>
          <p className="text-white/20 text-xs">
            A{" "}
            <a
              className="text-brand/40 transition-colors hover:text-brand"
              href="https://sycomsolutions.com"
            >
              Sycom Solutions
            </a>{" "}
            product
          </p>
        </div>
      </div>
    </footer>
  );
}
