"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";
export interface SecondaryMenuItem {
  path: Route;
  label: string;
}

function getActivePath(pathname: string, items: SecondaryMenuItem[]): string {
  const base = "/dashboard/settings";
  const active = items.find(({ path }) => {
    const isBase = path === base;
    return isBase
      ? pathname === path
      : pathname === path || pathname.startsWith(`${path}/`);
  });
  return active?.path ?? pathname;
}

export function SecondaryMenu({ items }: { items: SecondaryMenuItem[] }) {
  const pathname = usePathname();
  const activeValue = getActivePath(pathname, items);

  return (
    <Tabs
      aria-label="Account sections"
      className="-mx-4 border-border border-b pb-4 sm:mx-0"
      value={activeValue}
    >
      <TabsList
        className="h-auto min-h-10 scroll-pr-4 flex-nowrap gap-x-6 overflow-x-auto px-4 py-0 [-webkit-overflow-scrolling:touch] sm:px-0"
        variant="underline"
      >
        {items.map(({ path, label }) => (
          <TabsTab
            className="shrink-0 py-2"
            key={path}
            nativeButton={false}
            render={<Link href={path} />}
            value={path}
          >
            {label}
          </TabsTab>
        ))}
      </TabsList>
    </Tabs>
  );
}
