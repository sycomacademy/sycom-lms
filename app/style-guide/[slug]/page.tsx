import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { componentRegistry } from "@/components/components-registery";
import { BlockWrapper } from "@/components/demo/wrapper";
import { ModeSwitcher } from "@/components/layout/mode-switcher";

interface Props {
  params: Promise<{ slug: string }>;
}

const slugs = Object.keys(componentRegistry);

export function generateStaticParams() {
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = componentRegistry[slug];
  if (!config) {
    return { title: "Style guide" };
  }
  return {
    title: `${config.name} | Style guide`,
  };
}

export default async function StyleGuideSlugPage({ params }: Props) {
  const { slug } = await params;
  const config = componentRegistry[slug];
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
        <BlockWrapper title={config.label ?? config.name}>
          <Demo />
        </BlockWrapper>
      </main>
    </div>
  );
}
