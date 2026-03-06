"use client";

import { ArrowRight, Calendar, Clock } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionLabel } from "@/components/ui/section-label";
import { mockBlogPosts } from "@/lib/mock-data";

export function BlogSection() {
  const latestPosts = mockBlogPosts.slice(0, 3);

  return (
    <section className="py-20 lg:py-28" id="blog">
      <div className="container mx-auto px-4">
        <SectionLabel label="From the Blog" />
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl text-foreground md:text-4xl">
            Latest cybersecurity insights
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Stay ahead of evolving threats with expert analysis, career advice,
            and practical tutorials from our team.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post) => (
            <Link href={`/blog/${post.slug}` as Route} key={post.id}>
              <Card className="group/blog h-full transition-all hover:ring-primary/30">
                <div className="aspect-video w-full bg-muted">
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <span className="text-xs">{post.category}</span>
                  </div>
                </div>

                <CardContent className="flex flex-col p-5">
                  <div className="mb-3 flex items-center gap-2">
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
                      {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
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

        <div className="mt-12 text-center">
          <Button
            className="gap-2"
            nativeButton={false}
            render={
              <Link href={"/blog" as Route}>
                View all articles
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
            size="lg"
            variant="outline"
          />
        </div>
      </div>
    </section>
  );
}
