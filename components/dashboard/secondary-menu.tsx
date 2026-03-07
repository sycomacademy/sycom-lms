"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Link } from "@/components/layout/foresight-link";
import { Tabs, TabsList, TabsTab } from "@/components/ui/tabs";

export interface SecondaryMenuItem {
  path: Route;
  label: string;
}

function getActivePath(
  pathname: string,
  base: Route,
  items: SecondaryMenuItem[]
): string {
  const active = items.find(({ path }) => {
    const isBase = path === base;
    return isBase
      ? pathname === path
      : pathname === path || pathname.startsWith(`${path}/`);
  });
  return active?.path ?? pathname;
}

export function SecondaryMenu({
  label,
  base,
  items,
}: {
  label: string;
  base: Route;
  items: SecondaryMenuItem[];
}) {
  const pathname = usePathname();
  const activeValue = getActivePath(pathname, base, items);

  return (
    <Tabs
      aria-label={label}
      className="-mx-4 border-border border-b pb-4 sm:mx-0"
      value={activeValue}
    >
      <TabsList variant="underline">
        {items.map(({ path, label }) => (
          <TabsTab
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
