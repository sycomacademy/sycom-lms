"use client";

import Image from "next/image";
import Link from "next/link";

interface TenantOrg {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  metadata: string | null;
}

export function TenantShell({
  org,
  children,
}: {
  org: TenantOrg;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-border border-b bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <Link className="flex items-center gap-2 font-semibold" href="/">
            {org.logo ? (
              <Image
                alt={org.name}
                className="rounded"
                height={28}
                src={org.logo}
                width={28}
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded bg-primary font-bold text-primary-foreground text-sm">
                {org.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span>{org.name}</span>
          </Link>

          <nav className="ml-auto flex items-center gap-6 text-sm">
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/courses"
            >
              Courses
            </Link>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/dashboard"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
