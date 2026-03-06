"use client";

import type { Value } from "platejs";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/packages/utils/cn";
import { PlateEditor } from "../editor/plate-editor";

const EMPTY_VALUE: Value = [{ type: "p", children: [{ text: "" }] }];

/** Normalize Plate value so every node has the shape PlateStatic expects (no undefined children). */
function normalizePlateValue(raw: Value): Value {
  function normalizeNode(
    node: unknown
  ): { text: string } | Record<string, unknown> | null {
    if (node == null || typeof node !== "object") {
      return null;
    }
    const obj = node as Record<string, unknown>;
    if (typeof obj.text === "string") {
      return { ...obj };
    }
    if (typeof obj.type === "string") {
      const rawChildren = Array.isArray(obj.children) ? obj.children : [];
      const children = rawChildren
        .map(normalizeNode)
        .filter(
          (n): n is { text: string } | Record<string, unknown> => n != null
        );
      if (children.length === 0) {
        children.push({ text: "" });
      }
      return { ...obj, children };
    }
    return null;
  }

  const nodes = (Array.isArray(raw) ? raw : [])
    .map(normalizeNode)
    .filter((n): n is { text: string } | Record<string, unknown> => n != null);
  if (nodes.length === 0) {
    return EMPTY_VALUE;
  }
  return nodes as Value;
}

export function LessonViewer({
  className,
  value,
  onReachedEndChange,
}: {
  className?: string;
  value: Value | null | undefined;
  onReachedEndChange?: (atEnd: boolean) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [atEnd, setAtEnd] = useState(false);
  const normalizedValue = value ? normalizePlateValue(value) : EMPTY_VALUE;

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
      <PlateEditor readonly value={normalizedValue} variant="none" />
      <div className="h-10" ref={endRef} />

      <div aria-live="polite" className="sr-only">
        {atEnd ? "Reached end of lesson." : "Not yet at end of lesson."}
      </div>
    </div>
  );
}
