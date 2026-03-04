import Link from "next/link";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] items-center justify-center bg-background px-4 py-16">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-linear-to-b from-background via-background to-background/95 px-6 py-10 shadow-lg sm:px-10">
          <div className="pointer-events-none absolute -top-32 -left-32 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative space-y-6 text-left">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-medium text-primary text-xs uppercase tracking-[0.2em]">
              404 · page not found
            </span>

            <h1 className="bg-linear-to-r from-primary via-foreground to-primary bg-clip-text font-semibold text-3xl text-transparent sm:text-4xl lg:text-5xl">
              This path slipped past our defenses.
            </h1>

            <p className="max-w-xl text-muted-foreground text-sm sm:text-base">
              The page you’re looking for doesn&apos;t exist, was moved, or
              never made it past the perimeter. Let&apos;s get you back to where
              the learning happens.
            </p>

            <div className="grid gap-3 text-muted-foreground text-xs sm:text-sm">
              <p className="font-medium text-foreground">You can:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Return to the homepage to explore our cybersecurity labs.
                </li>
                <li>Check the URL for typos or outdated links.</li>
                <li>
                  Head to your dashboard if you&apos;re already enrolled in a
                  program.
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                className="inline-flex items-center justify-center rounded-none border border-transparent bg-primary px-5 py-2.5 font-medium text-primary-foreground text-sm shadow transition hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                href="/"
              >
                Back to homepage
                <span aria-hidden="true" className="ml-2 text-base">
                  ↩
                </span>
              </Link>

              <Link
                className="inline-flex items-center justify-center rounded-none border border-border bg-background px-5 py-2.5 font-medium text-foreground text-sm transition hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                href="/dashboard"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
