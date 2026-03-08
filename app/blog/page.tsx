import { Calendar, Clock } from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import { Link } from "@/components/layout/foresight-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SectionLabel } from "@/components/ui/section-label";
import { getQueryClient, trpc } from "@/packages/trpc/server";

export const metadata: Metadata = {
  title: "Blog | Sycom LMS",
  description:
    "Expert cybersecurity insights, career advice, and practical tutorials from the Sycom team.",
};

function formatPublishedDate(value: Date | null) {
  if (!value) {
    return "Unpublished";
  }

  return value.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const queryClient = getQueryClient();
  const { posts } = await queryClient.fetchQuery(
    trpc.blog.listPublic.queryOptions({
      limit: 24,
      offset: 0,
    })
  );

  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <main className="min-h-screen">
      <section className="bg-muted/30 py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <SectionLabel label="Blog" />
          <div className="text-center">
            <h1 className="mb-4 font-bold text-3xl text-foreground md:text-4xl lg:text-5xl">
              Cybersecurity insights
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Expert analysis, career advice, and practical tutorials to keep
              you ahead of evolving threats.
            </p>
          </div>
        </div>
      </section>

      {featuredPost ? (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Link href={`/blog/${featuredPost.slug}` as Route}>
              <Card className="group/featured mx-auto max-w-4xl transition-all hover:ring-primary/30">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative aspect-video min-h-0 overflow-hidden bg-muted md:aspect-auto md:min-h-[240px]">
                    {featuredPost.imageUrl ? (
                      <Image
                        alt={featuredPost.title}
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        src={featuredPost.imageUrl}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <span className="text-sm">Featured</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="flex min-w-0 flex-col justify-center p-6 md:p-8">
                    <Badge className="mb-3 w-fit" variant="secondary">
                      Featured article
                    </Badge>
                    <h2 className="mb-3 font-bold text-foreground text-xl group-hover/featured:text-primary md:text-2xl">
                      {featuredPost.title}
                    </h2>
                    <p className="mb-4 line-clamp-3 text-muted-foreground text-sm leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {formatPublishedDate(featuredPost.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {featuredPost.author.name}
                      </span>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </div>
        </section>
      ) : (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Empty className="mx-auto max-w-3xl border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Clock className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No blog posts yet</EmptyTitle>
                <EmptyDescription>
                  Published posts will appear here once the team starts sharing
                  insights.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        </section>
      )}

      {remainingPosts.length > 0 ? (
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
              {remainingPosts.map((post) => (
                <Link href={`/blog/${post.slug}` as Route} key={post.id}>
                  <Card className="group/blog h-full transition-all hover:ring-primary/30">
                    <div className="relative aspect-video w-full bg-muted">
                      {post.imageUrl ? (
                        <Image
                          alt={post.title}
                          className="object-cover"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          src={post.imageUrl}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <span className="text-xs">{post.author.name}</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="flex w-full flex-col p-5">
                      <div className="mb-3">
                        <Badge variant="secondary">Article</Badge>
                      </div>
                      <h3 className="mb-2 font-semibold text-foreground leading-snug group-hover/blog:text-primary">
                        {post.title}
                      </h3>
                      <p className="mb-4 flex-1 text-muted-foreground text-sm leading-relaxed">
                        {post.excerpt}
                      </p>
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
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
