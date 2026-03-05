import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/packages/auth/helper";
import { Skeleton } from "../ui/skeleton";
import { HeaderAuth } from "./header-auth";

const navLinks: { href: Route; label: string }[] = [
  { href: "/style-guide", label: "Style Guide" },
];

export async function Header() {
  const session = await getSession();
  const isSignedIn = !!session?.user;
  return (
    <header className="sticky top-0 z-50 w-full border-border border-b bg-background">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-4 py-4 sm:px-8">
        <Link
          className="inline-flex flex-col transition-opacity hover:opacity-90"
          href="/"
        >
          <span className="font-sans font-semibold text-xl tracking-tight sm:text-2xl">
            <span className="text-foreground">SYCOM</span>
          </span>
          <span className="mt-0.5 font-sans text-foreground text-xs uppercase tracking-wider sm:text-sm">
            Integrated Solutions
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
          {navLinks.map((item) => (
            <Link
              className="font-sans text-primary text-sm transition-colors hover:text-primary/70"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Suspense fallback={<Skeleton className="h-10 w-24" />}>
            <HeaderAuth isSignedIn={isSignedIn} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
