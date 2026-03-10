import type { Route } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Link } from "@/components/layout/foresight-link";
import { getSession } from "@/packages/auth/helper";
import { Skeleton } from "../ui/skeleton";
import { HeaderAuth } from "./header-auth";

const navLinks: { href: Route; label: string }[] = [
  { href: "/courses" as Route, label: "Courses" },
  { href: "/business" as Route, label: "Business" },
  { href: "/blog" as Route, label: "Blog" },
];

export async function Header() {
  const session = await getSession();
  const isSignedIn = !!session;
  return (
    <header className="sticky top-0 z-50 w-full border-border border-b bg-background">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-4 py-4 sm:px-8">
        <Link
          className="inline-flex transition-opacity hover:opacity-90"
          href="/"
        >
          <Image
            alt="Sycom Integrated Solutions"
            className="hidden h-12 w-auto sm:h-18 dark:block"
            height={48}
            priority
            src="/sycom-logo.png"
            width={200}
          />
          <Image
            alt="Sycom Integrated Solutions"
            className="h-12 w-auto sm:h-14 dark:hidden"
            height={48}
            priority
            src="/logos/sycom-logo-white.jpg"
            width={200}
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-6 md:flex">
          {navLinks.map((item) => (
            <Link
              className="font-sans text-primary text-sm transition-colors hover:text-primary/70 dark:text-primary-foreground dark:hover:text-primary/9p0"
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
