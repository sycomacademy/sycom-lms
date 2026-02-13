"use client";

import Link from "next/link";
import { ModeSwitcher } from "@/components/layout/theme-toggle";
import { componentRegistry } from "@/components/style/component-registry";
import { ComponentWrapper } from "@/components/style/demo/component-wrapper";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const uiEntries = Object.entries(componentRegistry).filter(
  ([, config]) => config.type === "registry:ui"
);

const blockEntries = Object.entries(componentRegistry).filter(
  ([, config]) => config.type === "registry:block"
);

const pageEntries = Object.entries(componentRegistry).filter(
  ([, config]) => config.type === "registry:page"
);

export default function StyleGuidePage() {
  return (
    <div className="w-full bg-background">
      <main className="mx-auto min-h-screen w-full min-w-0 max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <div className="flex w-full items-center justify-between gap-2">
            <h1 className="font-semibold text-2xl text-foreground tracking-tight">
              Style guide
            </h1>
            <div className="flex items-center gap-2">
              <ModeSwitcher />
              <Button
                className={"px-1"}
                nativeButton={false}
                render={<Link href="/" />}
                variant="link"
              >
                home
              </Button>
            </div>
          </div>
          <p className="mt-1 text-muted-foreground text-sm">
            Basic ui components showcase
          </p>
          <nav className="mt-4 flex flex-wrap gap-2">
            {uiEntries.map(([slug, config]) => (
              <Link
                className="rounded-md border border-border bg-background px-2 py-1 text-muted-foreground text-sm hover:bg-muted hover:text-foreground"
                href={config.href}
                key={slug}
              >
                {config.label ?? config.name}
              </Link>
            ))}
          </nav>
          <Separator className="my-4" />
          <p className="mt-1 text-muted-foreground text-sm">
            Basic block components showcase
          </p>
          <nav className="mt-4 flex flex-wrap gap-2">
            {blockEntries.map(([slug, config]) => (
              <Link
                className="rounded-md border border-border bg-background px-2 py-1 text-muted-foreground text-sm hover:bg-muted hover:text-foreground"
                href={config.href}
                key={slug}
              >
                {config.label ?? config.name}
              </Link>
            ))}
          </nav>
          <Separator className="my-4" />
          <p className="mt-1 text-muted-foreground text-sm">
            Page components showcase
          </p>
          <nav className="mt-4 flex flex-wrap gap-2">
            {pageEntries.map(([slug, config]) => (
              <Link
                className="rounded-md border border-border bg-background px-2 py-1 text-muted-foreground text-sm hover:bg-muted hover:text-foreground"
                href={config.href}
                key={slug}
              >
                {config.label ?? config.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {uiEntries.map(([slug, config]) => {
            const Demo = config.component;
            const title = config.label ?? config.name;
            return (
              <ComponentWrapper
                className="lg:col-span-1"
                key={slug}
                name={title}
                slug={config.href}
              >
                <Demo />
              </ComponentWrapper>
            );
          })}
          {blockEntries.map(([slug, config]) => {
            const Demo = config.component;
            const title = config.label ?? config.name;
            return (
              <ComponentWrapper
                className="lg:col-span-2"
                key={slug}
                name={title}
                slug={config.href}
              >
                <Demo />
              </ComponentWrapper>
            );
          })}
          {pageEntries.map(([slug, config]) => {
            const Demo = config.component;
            const title = config.label ?? config.name;
            return (
              <ComponentWrapper
                className="lg:col-span-2"
                key={slug}
                name={title}
                slug={config.href}
              >
                <Demo />
              </ComponentWrapper>
            );
          })}
        </div>
      </main>
    </div>
  );
}
