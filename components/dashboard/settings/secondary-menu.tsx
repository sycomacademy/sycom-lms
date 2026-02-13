"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppRoutes } from "@/.next/dev/types/routes";
import { cn } from "@/packages/utils/cn";

export interface SecondaryMenuItem {
  path: AppRoutes;
  label: string;
}

export function SecondaryMenu({ items }: { items: SecondaryMenuItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account sections"
      className="flex flex-wrap gap-x-6 gap-y-1 border-border border-b pb-4"
    >
      {items.map(({ path, label }) => {
        const isBase = path === "/dashboard/settings";
        const isActive = isBase
          ? pathname === path
          : pathname === path || pathname.startsWith(`${path}/`);
        return (
          <Link
            className={cn(
              "font-medium text-sm transition-colors hover:text-foreground",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
            href={path}
            key={path}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
