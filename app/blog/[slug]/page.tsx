import type { JSONContent } from "@tiptap/react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BlogPostBody } from "@/components/blog/blog-post-body";
import { Link } from "@/components/layout/foresight-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getQueryClient, trpc } from "@/packages/trpc/server";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const queryClient = getQueryClient();
  const post = await queryClient.fetchQuery(
    trpc.blog.getPublicBySlug.queryOptions({ slug })
  );
  if (!post) {
    return { title: "Post Not Found" };
  }
  return {
    title: `${post.title} | Sycom Blog`,
    description: post.excerpt,
  };
}

function getAuthorRoleLabel(role: string | null) {
  if (role === "platform_admin") {
    return "Platform Admin";
  }

  if (role === "content_creator") {
    return "Instructor";
  }

  return "Sycom Team";
}

function formatPublishedDate(value: Date | null) {
  if (!value) {
    return "Unpublished";
  }

  return value.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const queryClient = getQueryClient();

  const post = await queryClient.fetchQuery(
    trpc.blog.getPublicBySlug.queryOptions({ slug })
  );

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <article className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <Button
              className="mb-8 gap-2 px-1"
              nativeButton={false}
              render={
                <Link href={"/blog" as Route}>
                  <ArrowLeft className="h-4 w-4" />
                  Back to blog
                </Link>
              }
              variant="link"
            />

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
                    {getAuthorRoleLabel(post.author.role ?? null)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground text-xs">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatPublishedDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.author.name}
                </span>
              </div>
              <Badge variant="secondary">Article</Badge>
            </div>

            <div className="mb-8 aspect-video w-full bg-muted">
              {post.imageUrl ? (
                <Image
                  alt={post.title}
                  className="h-full w-full object-cover"
                  height={540}
                  src={post.imageUrl}
                  width={960}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <span className="text-sm">Cover image</span>
                </div>
              )}
            </div>

            <div className="max-w-none text-foreground">
              <BlogPostBody
                content={
                  post.content as JSONContent | unknown[] | null | undefined
                }
              />
            </div>
          </div>
        </div>
      </article>

      {post.relatedPosts.length > 0 && (
        <section className="border-border border-t bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center font-bold text-2xl text-foreground">
              Related articles
            </h2>
            <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
              {post.relatedPosts.map((related) => (
                <Link href={`/blog/${related.slug}` as Route} key={related.id}>
                  <div className="group/related border border-border bg-card p-6 transition-all hover:border-primary/30">
                    <Badge className="mb-3" variant="secondary">
                      Article
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
  );
}
