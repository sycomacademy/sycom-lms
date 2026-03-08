import { ArrowLeft, Calendar, Clock } from "lucide-react";
import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { mockBlogPosts } from "@/components/landing/mock-data";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/components/layout/foresight-link";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LIST_ITEM_RE = /^-\s*/;
const ORDERED_ITEM_RE = /^\d+\.\s*/;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = mockBlogPosts.find((p) => p.slug === slug);
  if (!post) {
    return { title: "Post Not Found" };
  }
  return {
    title: `${post.title} | Sycom Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = mockBlogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = mockBlogPosts
    .filter((p) => p.id !== post.id)
    .slice(0, 2);

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <article className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <Button
                className="mb-8 gap-2"
                nativeButton={false}
                render={
                  <Link href={"/blog" as Route}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to blog
                  </Link>
                }
                size="sm"
                variant="ghost"
              />

              <Badge className="mb-4" variant="secondary">
                {post.category}
              </Badge>

              <h1 className="mb-6 font-bold text-3xl text-foreground leading-tight md:text-4xl">
                {post.title}
              </h1>

              <div className="mb-8 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                    <span className="font-semibold text-primary text-sm">
                      {post.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {post.author.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {post.author.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime}
                  </span>
                </div>
              </div>

              <div className="mb-8 aspect-video w-full bg-muted">
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <span className="text-sm">{post.category} — Cover image</span>
                </div>
              </div>

              <div className="prose prose-lg max-w-none text-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:font-bold [&_h2]:text-2xl [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-semibold [&_h3]:text-xl [&_li]:text-muted-foreground [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_strong]:text-foreground [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6">
                {post.content.split("\n\n").map((paragraph, i) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) {
                    return null;
                  }

                  if (trimmed.startsWith("## ")) {
                    return (
                      <h2 key={`p-${post.id}-${i}`}>
                        {trimmed.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (trimmed.startsWith("### ")) {
                    return (
                      <h3 key={`p-${post.id}-${i}`}>
                        {trimmed.replace("### ", "")}
                      </h3>
                    );
                  }

                  if (trimmed.includes("\n- ") || trimmed.startsWith("- ")) {
                    const lines = trimmed.split("\n").filter(Boolean);
                    return (
                      <ul key={`p-${post.id}-${i}`}>
                        {lines.map((line, j) => (
                          <li key={`li-${post.id}-${i}-${j}`}>
                            {line.replace(LIST_ITEM_RE, "")}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  if (trimmed.includes("\n1. ") || trimmed.startsWith("1. ")) {
                    const lines = trimmed.split("\n").filter(Boolean);
                    return (
                      <ol key={`p-${post.id}-${i}`}>
                        {lines.map((line, j) => (
                          <li key={`ol-${post.id}-${i}-${j}`}>
                            {line.replace(ORDERED_ITEM_RE, "")}
                          </li>
                        ))}
                      </ol>
                    );
                  }

                  return <p key={`p-${post.id}-${i}`}>{trimmed}</p>;
                })}
              </div>
            </div>
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <section className="border-border border-t bg-muted/30 py-16">
            <div className="container mx-auto px-4">
              <h2 className="mb-8 text-center font-bold text-2xl text-foreground">
                Related articles
              </h2>
              <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                {relatedPosts.map((related) => (
                  <Link
                    href={`/blog/${related.slug}` as Route}
                    key={related.id}
                  >
                    <div className="group/related border border-border bg-card p-6 transition-all hover:border-primary/30">
                      <Badge className="mb-3" variant="secondary">
                        {related.category}
                      </Badge>
                      <h3 className="mb-2 font-semibold text-foreground group-hover/related:text-primary">
                        {related.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {related.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
