import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModeSwitcher } from "@/components/layout/mode-switcher";
import { componentRegistry } from "@/components/style-guide/component-registry";
import { Example } from "@/components/style-guide/demo/example";

interface Props {
  params: Promise<{ name: string }>;
}

const slugs = Object.keys(componentRegistry);

export function generateStaticParams() {
  return slugs.map((name) => ({ name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const config = componentRegistry[name];
  if (!config) {
    return { title: "Style guide" };
  }
  return {
    title: `${config.name} | Style guide`,
  };
}

export default async function StyleGuideSlugPage({ params }: Props) {
  const { name } = await params;
  const config = componentRegistry[name];
  if (!config) {
    notFound();
  }

  const Demo = config.component;

  return (
    <div className="w-full bg-background">
      <main className="mx-auto min-h-screen w-full min-w-0 max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-6">
          <div className="flex w-full items-center justify-between gap-2">
            <Link
              className="text-muted-foreground text-sm hover:text-foreground"
              href="/style-guide"
            >
              ← Style guide
            </Link>
            <ModeSwitcher />
          </div>

          <h1 className="mt-2 font-semibold text-2xl text-foreground tracking-tight">
            {config.name}
          </h1>
        </div>
        <Example title={config.label ?? config.name}>
          <Demo />
        </Example>
      </main>
    </div>
  );
}
