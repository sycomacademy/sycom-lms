import { Calendar, Clock } from "lucide-react";
import type { Metadata, Route } from "next";
import { mockBlogPosts } from "@/components/landing/mock-data";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/components/layout/foresight-link";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";

export const metadata: Metadata = {
  title: "Blog | Sycom LMS",
  description:
    "Expert cybersecurity insights, career advice, and practical tutorials from the Sycom team.",
};

export default function BlogPage() {
  const featuredPost = mockBlogPosts[0];
  const remainingPosts = mockBlogPosts.slice(1);

  return (
    <>
      <Header />
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

        {featuredPost && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <Link href={`/blog/${featuredPost.slug}` as Route}>
                <Card className="group/featured mx-auto max-w-4xl overflow-hidden transition-all hover:ring-primary/30 md:flex-row">
                  <div className="flex flex-col md:flex-row">
                    <div className="aspect-video bg-muted md:w-1/2">
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <span className="text-sm">Featured</span>
                      </div>
                    </div>
                    <CardContent className="flex flex-col justify-center p-6 md:w-1/2 md:p-8">
                      <Badge className="mb-3 w-fit" variant="secondary">
                        {featuredPost.category}
                      </Badge>
                      <h2 className="mb-3 font-bold text-foreground text-xl group-hover/featured:text-primary md:text-2xl">
                        {featuredPost.title}
                      </h2>
                      <p className="mb-4 text-muted-foreground text-sm leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(
                            featuredPost.publishedAt
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Clock className="h-3.5 w-3.5" />
                          {featuredPost.readTime}
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </div>
          </section>
        )}

        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
              {remainingPosts.map((post) => (
                <Link href={`/blog/${post.slug}` as Route} key={post.id}>
                  <Card className="group/blog h-full transition-all hover:ring-primary/30">
                    <div className="aspect-video w-full bg-muted">
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <span className="text-xs">{post.category}</span>
                      </div>
                    </div>
                    <CardContent className="flex flex-col p-5">
                      <div className="mb-3">
                        <Badge variant="secondary">{post.category}</Badge>
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
                          {new Date(post.publishedAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
