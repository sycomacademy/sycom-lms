import {
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  variant?: "default" | "outline" | "filled";
  size?: "sm" | "md" | "lg";
}

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
];

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function SocialLinks({
  variant = "default",
  size = "md",
}: SocialLinksProps) {
  return (
    <div className="flex items-center gap-3">
      {socialLinks.map((social) => (
        <a
          aria-label={social.label}
          className={cn(
            "flex items-center justify-center rounded-lg transition-colors",
            sizeClasses[size],
            variant === "default" && "text-muted-foreground hover:text-primary",
            variant === "outline" &&
              "border border-border text-muted-foreground hover:border-primary hover:text-primary",
            variant === "filled" &&
              "bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground"
          )}
          href={social.href}
          key={social.label}
        >
          <social.icon className={iconSizes[size]} />
        </a>
      ))}
    </div>
  );
}

export function SocialLinksShowcase() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 font-medium text-muted-foreground text-sm">
          Default
        </p>
        <SocialLinks variant="default" />
      </div>
      <div>
        <p className="mb-3 font-medium text-muted-foreground text-sm">
          Outline
        </p>
        <SocialLinks variant="outline" />
      </div>
      <div>
        <p className="mb-3 font-medium text-muted-foreground text-sm">Filled</p>
        <SocialLinks variant="filled" />
      </div>
    </div>
  );
}
