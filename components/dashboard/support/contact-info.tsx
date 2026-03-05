"use client";

import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TwitterIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ContactItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}

interface SocialLink {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const contactInfo: ContactItem[] = [
  {
    icon: <PhoneIcon className="size-4" />,
    label: "Phone",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
  },
  {
    icon: <MailIcon className="size-4" />,
    label: "Email",
    value: "support@sycom.edu",
    href: "mailto:support@sycom.edu",
  },
];

const socialLinks: SocialLink[] = [
  {
    icon: <TwitterIcon className="size-4" />,
    label: "Twitter",
    href: "https://twitter.com/sycom",
  },
  {
    icon: <FacebookIcon className="size-4" />,
    label: "Facebook",
    href: "https://facebook.com/sycom",
  },
  {
    icon: <InstagramIcon className="size-4" />,
    label: "Instagram",
    href: "https://instagram.com/sycom",
  },
  {
    icon: <LinkedinIcon className="size-4" />,
    label: "LinkedIn",
    href: "https://linkedin.com/company/sycom",
  },
];

export function ContactInfo() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {/* Contact Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium text-foreground text-sm">
              Contact Information
            </h3>
            <p className="text-muted-foreground text-xs">
              Reach out to us directly through any of the following channels.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {contactInfo.map((contact) => (
              <div
                className="flex items-center gap-3 rounded-none border border-border p-3"
                key={contact.label}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {contact.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">
                    {contact.label}
                  </span>
                  {contact.href ? (
                    <a
                      className="font-medium text-foreground text-sm hover:underline"
                      href={contact.href}
                    >
                      {contact.value}
                    </a>
                  ) : (
                    <span className="font-medium text-foreground text-sm">
                      {contact.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium text-foreground text-sm">
              Follow Us on Social Media
            </h3>
            <p className="text-muted-foreground text-xs">
              Stay connected and get the latest updates from our social
              channels.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {socialLinks.map((social) => (
              <a
                className="flex items-center gap-2 rounded-none border border-border px-4 py-2 text-muted-foreground text-xs transition-colors hover:border-foreground/30 hover:bg-muted hover:text-foreground"
                href={social.href}
                key={social.label}
                rel="noopener noreferrer"
                target="_blank"
              >
                {social.icon}
                <span>{social.label}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Hours & Address */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium text-foreground text-sm">
              Business Hours & Location
            </h3>
            <p className="text-muted-foreground text-xs">
              Our support team is available during the following hours.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2 text-xs">
            <div className="flex justify-between border-border border-b py-2">
              <span className="text-muted-foreground">Monday - Friday</span>
              <span className="font-medium text-foreground">
                9:00 AM - 6:00 PM
              </span>
            </div>
            <div className="flex justify-between border-border border-b py-2">
              <span className="text-muted-foreground">Saturday</span>
              <span className="font-medium text-foreground">
                10:00 AM - 4:00 PM
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Sunday</span>
              <span className="font-medium text-foreground">Closed</span>
            </div>
          </div>
          <p className="mt-4 text-muted-foreground text-xs">
            All times are in Eastern Standard Time (EST).
          </p>

          {/* Address */}
          <div className="mt-6 flex items-start gap-3 rounded-none border border-border p-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <MapPinIcon className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Address</span>
              <span className="font-medium text-foreground text-sm">
                123 Education Lane
              </span>
              <span className="text-muted-foreground text-xs">
                Suite 400, Learning District
              </span>
              <span className="text-muted-foreground text-xs">
                New York, NY 10001
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
