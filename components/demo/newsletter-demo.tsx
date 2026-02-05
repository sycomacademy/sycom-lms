"use client";

import { CheckCircle, Mail } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterDemo() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="bg-primary py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <Mail className="mx-auto mb-4 h-12 w-12 text-primary-foreground/80" />
          <h2 className="mb-2 font-bold text-2xl text-primary-foreground md:text-3xl">
            Stay Updated
          </h2>
          <p className="mb-6 text-primary-foreground/80">
            Subscribe to our newsletter for the latest cybersecurity insights,
            tips, and industry news.
          </p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-primary-foreground">
              <CheckCircle className="h-5 w-5" />
              <span>Thank you for subscribing!</span>
            </div>
          ) : (
            <form
              className="flex flex-col gap-3 sm:flex-row sm:justify-center"
              onSubmit={handleSubmit}
            >
              <Input
                className="h-10 max-w-sm border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                type="email"
                value={email}
              />
              <Button
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                type="submit"
                variant="secondary"
              >
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
