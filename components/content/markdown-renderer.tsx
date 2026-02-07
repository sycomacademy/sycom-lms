import "highlight.js/styles/github.min.css";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { cn } from "@/packages/utils/cn";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mt-8 mb-4 font-bold text-3xl text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-6 mb-3 font-bold text-2xl text-foreground">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-4 mb-2 font-semibold text-foreground text-xl">
      {children}
    </h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="mt-3 mb-2 font-semibold text-foreground text-lg">
      {children}
    </h4>
  ),
  h5: ({ children }: { children?: React.ReactNode }) => (
    <h5 className="mt-2 mb-1 font-medium text-base text-foreground">
      {children}
    </h5>
  ),
  h6: ({ children }: { children?: React.ReactNode }) => (
    <h6 className="mt-2 mb-1 font-medium text-foreground text-sm">
      {children}
    </h6>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-4 text-foreground">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-4 list-disc pl-6 text-foreground">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-4 list-decimal pl-6 text-foreground">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="mb-1">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <Link
      className="font-medium text-primary underline-offset-4 hover:underline"
      href={href ?? "#"}
    >
      {children}
    </Link>
  ),
  code: ({
    className,
    children,
    ...props
  }: {
    className?: string;
    children?: React.ReactNode;
  }) => {
    const isBlock = className?.includes("language-");
    return (
      <code
        className={cn(
          isBlock ? "block p-4 font-mono text-sm" : "font-mono text-sm",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg border border-border bg-muted p-4">
      {children}
    </pre>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="my-4 w-full overflow-x-auto">
      <table className="w-full caption-bottom border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="border-border border-b [&_tr]:border-b">{children}</thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => (
    <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="border-border border-b transition-colors hover:bg-muted/50">
      {children}
    </tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="h-10 px-4 text-left align-middle font-medium text-foreground [&:has([role=checkbox])]:pr-0">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {children}
    </td>
  ),
};

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div className={cn("max-w-none text-foreground", className)}>
      <ReactMarkdown
        components={markdownComponents}
        rehypePlugins={[rehypeHighlight]}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
