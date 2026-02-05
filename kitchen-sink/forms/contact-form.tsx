"use client";

import { CheckCircle, Send } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="mb-4 h-12 w-12 text-primary" />
        <h3 className="mb-2 font-semibold text-foreground text-xl">
          Message Sent!
        </h3>
        <p className="text-muted-foreground">
          We&apos;ll get back to you within 24 hours.
        </p>
        <Button
          className="mt-4 bg-transparent"
          onClick={() => setSubmitted(false)}
          variant="outline"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" placeholder="John" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" placeholder="Doe" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="john@company.com"
          required
          type="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" placeholder="Your Company Name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Tell us about your security needs..."
          required
          rows={5}
        />
      </div>
      <Button className="w-full gap-2" type="submit">
        <Send className="h-4 w-4" />
        Send Message
      </Button>
    </form>
  );
}

export function ContactSection() {
  return (
    <section className="bg-card py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Info Side */}
          <div>
            <p className="mb-2 font-medium text-primary text-sm uppercase tracking-widest">
              Get in Touch
            </p>
            <h2 className="mb-4 font-bold text-3xl text-foreground md:text-4xl">
              Ready to Secure Your Business?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Contact us today for a free consultation. Our security experts are
              ready to help you protect your organization from cyber threats.
            </p>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-muted-foreground">contact@sycom.com</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Phone</p>
                <p className="text-muted-foreground">+1 (234) 567-890</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Address</p>
                <p className="text-muted-foreground">
                  123 Security Lane, Cyber City, CC 12345
                </p>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="rounded-lg border border-border bg-background p-6 lg:p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
