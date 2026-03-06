"use client";

import type { JSONContent } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { Editor } from "@/components/editor/editor";
import { cn } from "@/packages/utils/cn";

export function LessonViewer({
  className,
  content,
  onReachedEndChange,
}: {
  className?: string;
  content: JSONContent | null | undefined;
  onReachedEndChange?: (atEnd: boolean) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const root = scrollRef.current;
    const end = endRef.current;
    if (!(root && end)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextAtEnd = entry?.isIntersecting === true;
        setAtEnd((prev) => {
          if (prev === nextAtEnd) {
            return prev;
          }
          onReachedEndChange?.(nextAtEnd);
          return nextAtEnd;
        });
      },
      { root, threshold: 0.1 }
    );

    observer.observe(end);
    return () => observer.disconnect();
  }, [onReachedEndChange]);

  return (
    <div
      className={cn("h-full min-h-0 overflow-y-auto px-6 py-6", className)}
      ref={scrollRef}
    >
      {content ? (
        <div className="prose prose-neutral dark:prose-invert max-w-none [&_.editor-content]:min-h-0 [&_.editor-content]:p-0">
          <Editor content={content} editable={false} variant="full" />
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No content for this lesson.
        </p>
      )}
      <div className="h-10" ref={endRef} />
      <div aria-live="polite" className="sr-only">
        {atEnd ? "Reached end of lesson." : "Not yet at end of lesson."}
      </div>
    </div>
  );
}
