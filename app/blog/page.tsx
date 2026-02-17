import { ArrowRight, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { getAllBlogPosts } from "@/packages/db/queries/blog";

export default async function BlogPage() {
  const blogPosts = await getAllBlogPosts();
  return (
    <>
      <Header />
      <main>
        <section className="relative bg-muted py-16 lg:py-24">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 to-muted" />
          <div className="absolute inset-0 z-0 bg-foreground/70" />
          <div className="container relative z-10 mx-auto px-4 [&_.text-muted-foreground]:text-background/90">
            <SectionLabel label="Blog" />
            <h1 className="mb-4 font-bold text-4xl text-background md:text-5xl">
              Latest Articles
            </h1>
            <p className="max-w-2xl text-background/85 text-lg">
              Stay updated with the latest insights, tips, and news from the
              cybersecurity world. Learn from industry experts and advance your
              knowledge.
            </p>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Card
                  className="group overflow-hidden transition-all hover:border-primary/50"
                  key={post.id}
                >
                  <div className="relative aspect-video bg-secondary">
                    {post.featuredImageUrl ? (
                      <Image
                        alt={post.title}
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={post.featuredImageUrl}
                      />
                    ) : null}
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center gap-3">
                      <Badge className="text-xs" variant="outline">
                        {post.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString(
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
                      {post.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">
                      {post.excerpt}
                    </p>
                    <Link
                      className="inline-flex items-center gap-2 font-medium text-primary text-sm transition-colors hover:text-primary/80"
                      href={`/blog/${post.slug}`}
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
      </main>
      <Footer />
    </>
  );
}
