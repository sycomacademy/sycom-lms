"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/packages/utils/cn";

const settingsTabs = [
  { label: "General", href: "/dashboard/settings/general" },
  { label: "Auth", href: "/dashboard/settings/auth" },
  { label: "Notifications", href: "/dashboard/settings/notifications" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 border-border border-b">
      {settingsTabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            className={cn(
              "relative pb-3 font-medium text-sm transition-colors hover:text-foreground",
              isActive
                ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground"
                : "text-muted-foreground"
            )}
            href={tab.href}
            key={tab.href}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
