"use client";

import { ArrowRight, Clock } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "@/components/layout/foresight-link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { mockBlogPosts } from "@/packages/utils/mock-data";

export function BlogPreview() {
  const posts = mockBlogPosts.slice(0, 3);
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <section className="relative bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div>
            <span className="font-mono text-primary/60 text-xs uppercase tracking-widest">
              From the Blog
            </span>
            <h2 className="mt-3 font-bold text-3xl text-foreground sm:text-4xl">
              Latest <span className="text-primary">insights</span>
            </h2>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/blog" />}
            variant="outline"
          >
            All Articles
            <ArrowRight className="ml-1 size-3.5" data-icon="inline-end" />
          </Button>
        </motion.div>

        {posts.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Clock />
              </EmptyMedia>
              <EmptyTitle>No articles yet</EmptyTitle>
              <EmptyDescription>
                Blog posts will appear here once published. Check back soon for
                the latest insights.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          featured && (
            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <Card className="h-full pt-0">
                  <div className="h-56 bg-linear-to-br from-primary/10 to-primary/5">
                    <div className="flex h-full items-center justify-center font-mono text-4xl text-primary/10">
                      {featured.category
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </div>
                  </div>

                  <CardContent>
                    <div className="mb-3 flex items-center gap-3 text-xs">
                      <span className="font-mono text-primary/50 uppercase tracking-wider">
                        {featured.category}
                      </span>
                      <span className="text-muted-foreground">|</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="size-3" />
                        {featured.readTime}
                      </span>
                    </div>
                    <h3 className="mb-3 font-semibold text-xl leading-snug">
                      {featured.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {featured.excerpt}
                    </p>
                  </CardContent>

                  <CardFooter className="gap-3">
                    <div className="flex size-7 items-center justify-center bg-primary/10 font-mono text-primary text-xs">
                      {featured.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {featured.author.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {featured.publishedAt}
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>

              <div className="flex flex-col gap-6">
                {rest.map((post, i) => (
                  <motion.div
                    className="flex-1"
                    initial={{ opacity: 0, y: 20 }}
                    key={post.id}
                    transition={{ duration: 0.4, delay: (i + 1) * 0.1 }}
                    viewport={{ once: true }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    <Card className="h-full">
                      <CardContent className="flex flex-1 flex-col">
                        <div className="mb-3 flex items-center gap-3 text-xs">
                          <span className="font-mono text-primary/50 uppercase tracking-wider">
                            {post.category}
                          </span>
                          <span className="text-muted-foreground">|</span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="size-3" />
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="mb-2 font-semibold text-lg leading-snug">
                          {post.title}
                        </h3>
                        <p className="flex-1 text-muted-foreground text-sm leading-relaxed">
                          {post.excerpt}
                        </p>
                      </CardContent>

                      <CardFooter className="gap-3">
                        <div className="flex size-7 items-center justify-center bg-primary/10 font-mono text-primary text-xs">
                          {post.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <p className="font-medium text-sm">
                          {post.author.name}
                        </p>
                        <p className="ml-auto text-muted-foreground text-xs">
                          {post.publishedAt}
                        </p>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
