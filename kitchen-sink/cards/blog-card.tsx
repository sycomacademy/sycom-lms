import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface BlogCardProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  imageUrl?: string;
  href?: string;
}

export function BlogCard({
  title,
  excerpt,
  date,
  category,
  href = "#",
}: BlogCardProps) {
  return (
    <Card className="group overflow-hidden border-border bg-card transition-all hover:border-primary/50">
      <div className="aspect-video bg-secondary" />
      <CardContent className="p-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
            {category}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <Calendar className="h-3 w-3" />
            {date}
          </span>
        </div>
        <h3 className="mb-2 font-semibold text-foreground text-lg transition-colors group-hover:text-primary">
          {title}
        </h3>
        <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">
          {excerpt}
        </p>
        <Link
          className="inline-flex items-center gap-2 font-medium text-primary text-sm transition-colors hover:text-primary/80"
          href={href}
        >
          Read more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardContent>
    </Card>
  );
}

export function BlogCardDemo() {
  const posts = [
    {
      title: "10 Essential Cybersecurity Practices for 2024",
      excerpt:
        "Stay ahead of threats with these proven security strategies that every organization should implement.",
      date: "Jan 15, 2024",
      category: "Security",
    },
    {
      title: "Understanding Zero Trust Architecture",
      excerpt:
        "A deep dive into the zero trust security model and how to implement it in your organization.",
      date: "Jan 10, 2024",
      category: "Infrastructure",
    },
    {
      title: "The Rise of AI-Powered Threat Detection",
      excerpt:
        "How artificial intelligence is revolutionizing the way we detect and respond to cyber threats.",
      date: "Jan 5, 2024",
      category: "AI & ML",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.title} {...post} />
      ))}
    </div>
  );
}
