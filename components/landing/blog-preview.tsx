"use client";

import { ArrowRight, Clock } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "@/components/layout/foresight-link";

import { Button } from "@/components/ui/button";
import { mockBlogPosts } from "@/packages/utils/mock-data";

export function BlogPreview() {
  const posts = mockBlogPosts.slice(0, 3);
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <section className="relative bg-[oklch(0.08_0.005_285.823)] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div>
            <span className="font-mono text-brand/60 text-xs uppercase tracking-widest">
              From the Blog
            </span>
            <h2 className="mt-3 font-bold text-3xl text-white sm:text-4xl">
              Latest <span className="text-brand">insights</span>
            </h2>
          </div>
          <Button
            className="border-white/10 text-white hover:border-white/20 hover:bg-white/5"
            nativeButton={false}
            render={<Link href="/blog" />}
            variant="outline"
          >
            All Articles
            <ArrowRight className="ml-1 size-3.5" data-icon="inline-end" />
          </Button>
        </motion.div>

        {featured && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Featured post */}
            <motion.article
              className="group border border-white/5 bg-[oklch(0.1_0.005_285.823)] transition-colors hover:border-brand/20"
              initial={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="h-56 bg-gradient-to-br from-brand/10 to-brand/5">
                <div className="flex h-full items-center justify-center font-mono text-4xl text-brand/10">
                  {featured.category
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
              </div>
              <div className="p-6">
                <div className="mb-3 flex items-center gap-3 text-xs">
                  <span className="font-mono text-brand/50 uppercase tracking-wider">
                    {featured.category}
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="flex items-center gap-1 text-white/30">
                    <Clock className="size-3" />
                    {featured.readTime}
                  </span>
                </div>
                <h3 className="mb-3 font-semibold text-white text-xl leading-snug">
                  {featured.title}
                </h3>
                <p className="mb-4 text-sm text-white/40 leading-relaxed">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-3 border-white/5 border-t pt-4">
                  <div className="flex size-7 items-center justify-center bg-brand/10 font-mono text-brand text-xs">
                    {featured.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">
                      {featured.author.name}
                    </p>
                    <p className="text-white/30 text-xs">
                      {featured.publishedAt}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>

            {/* Other posts */}
            <div className="flex flex-col gap-6">
              {rest.map((post, i) => (
                <motion.article
                  className="group flex flex-1 flex-col border border-white/5 bg-[oklch(0.1_0.005_285.823)] p-6 transition-colors hover:border-brand/20"
                  initial={{ opacity: 0, y: 20 }}
                  key={post.id}
                  transition={{ duration: 0.4, delay: (i + 1) * 0.1 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-3 flex items-center gap-3 text-xs">
                    <span className="font-mono text-brand/50 uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="text-white/20">|</span>
                    <span className="flex items-center gap-1 text-white/30">
                      <Clock className="size-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="mb-2 font-semibold text-lg text-white leading-snug">
                    {post.title}
                  </h3>
                  <p className="mb-4 flex-1 text-sm text-white/40 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 border-white/5 border-t pt-4">
                    <div className="flex size-7 items-center justify-center bg-brand/10 font-mono text-brand text-xs">
                      {post.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <p className="font-medium text-sm text-white">
                      {post.author.name}
                    </p>
                    <p className="ml-auto text-white/30 text-xs">
                      {post.publishedAt}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
