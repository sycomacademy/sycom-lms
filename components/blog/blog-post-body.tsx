"use client";

import type { JSONContent } from "@tiptap/react";
import { Editor } from "@/components/editor/editor";

function normalizeContent(
  value: JSONContent | unknown[] | null | undefined
): JSONContent | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "object" && "type" in (value as object)) {
    return value as JSONContent;
  }

  if (Array.isArray(value)) {
    return { type: "doc", content: value as JSONContent[] };
  }

  return undefined;
}

export function BlogPostBody({
  content,
}: {
  content: JSONContent | unknown[] | null | undefined;
}) {
  const normalized = normalizeContent(content);

  if (!normalized) {
    return (
      <p className="text-muted-foreground text-sm">
        No content for this post yet.
      </p>
    );
  }

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none p-0 [&_.editor-content]:min-h-0 [&_.editor-content]:p-0">
      <Editor content={normalized} editable={false} variant="full" />
    </div>
  );
}
