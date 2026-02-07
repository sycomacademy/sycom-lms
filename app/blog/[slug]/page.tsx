import { ArrowRight, Calendar, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/content/markdown-renderer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import {
  getAllBlogPostSlugs,
  getBlogPostBySlug,
  getRelatedPosts,
} from "@/packages/db/queries/blog";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.id, 3);

  return (
    <>
      <Header />
      <main>
        {/* Article Header */}
        <section className="relative bg-muted py-16 lg:py-24">
          <div className="absolute inset-0 z-0">
            <Image
              alt=""
              className="object-cover"
              fill
              priority
              sizes="100vw"
              src="/images/landscape.png"
            />
            <div className="absolute inset-0 bg-foreground/70" />
          </div>
          <div className="container relative z-10 mx-auto px-4 [&_.text-muted-foreground]:text-background/90">
            <SectionLabel label="Blog" />
            <div className="mx-auto max-w-3xl text-background">
              <div className="mb-4 flex items-center gap-3">
                <Badge
                  className="border-background/50 text-background"
                  variant="outline"
                >
                  {post.category}
                </Badge>
                <span className="flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                {post.readingTime && (
                  <span className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4" />
                    {post.readingTime} min read
                  </span>
                )}
              </div>
              <h1 className="mb-4 font-bold text-4xl md:text-5xl">
                {post.title}
              </h1>
              {post.author && (
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarImage
                      alt={post.author.name}
                      src={post.author.photoUrl ?? "/images/avatar.png"}
                    />
                    <AvatarFallback className="relative">
                      <Image
                        alt=""
                        className="rounded-full object-cover"
                        fill
                        src="/images/avatar.png"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{post.author.name}</p>
                    {post.author.bio && (
                      <p className="text-background/85 text-xs">
                        {post.author.bio}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <article className="prose prose-slate dark:prose-invert mx-auto max-w-3xl">
              {post.featuredImageUrl ? (
                <div className="relative mb-8 aspect-video overflow-hidden rounded-lg bg-secondary">
                  <Image
                    alt={post.title}
                    className="object-cover"
                    fill
                    sizes="(max-width: 1024px) 100vw, 896px"
                    src={post.featuredImageUrl}
                  />
                </div>
              ) : null}
              <MarkdownRenderer content={post.content} />
            </article>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-muted py-16 lg:py-24">
            <div className="container mx-auto px-4">
              <SectionLabel label="Related Articles" />
              <h2 className="mb-8 font-bold text-3xl text-foreground md:text-4xl">
                You Might Also Like
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Card
                    className="group overflow-hidden transition-all hover:border-primary/50"
                    key={relatedPost.id}
                  >
                    <div className="relative aspect-video bg-secondary">
                      {relatedPost.featuredImageUrl ? (
                        <Image
                          alt={relatedPost.title}
                          className="object-cover"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          src={relatedPost.featuredImageUrl}
                        />
                      ) : null}
                    </div>
                    <CardContent className="p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <Badge className="text-xs" variant="outline">
                          {relatedPost.category}
                        </Badge>
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Calendar className="h-3 w-3" />
                          {new Date(relatedPost.publishedAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <h3 className="mb-2 font-semibold text-foreground text-lg transition-colors group-hover:text-primary">
                        {relatedPost.title}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">
                        {relatedPost.excerpt}
                      </p>
                      <Link
                        className="inline-flex items-center gap-2 font-medium text-primary text-sm transition-colors hover:text-primary/80"
                        href={`/blog/${relatedPost.slug}`}
                      >
                        Read more
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </CardContent>
                  </Card>
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
