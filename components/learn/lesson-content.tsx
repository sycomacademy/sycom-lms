"use client";

import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarkdownRenderer } from "@/components/content/markdown-renderer";

interface LessonContentProps {
  lessonType: string;
  content: string | null;
  videoUrl: string | null;
  onContentReady: () => void;
}

export function LessonContent({
  lessonType,
  content,
  videoUrl,
  onContentReady,
}: LessonContentProps) {
  const [videoStarted, setVideoStarted] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);

  // For articles: detect when user scrolls to the bottom of the content
  useEffect(() => {
    if (
      lessonType !== "article" &&
      lessonType !== "mixed" &&
      lessonType !== "image"
    ) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasTriggered.current) {
            hasTriggered.current = true;
            onContentReady();
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [lessonType, onContentReady]);

  const handleVideoPlay = useCallback(() => {
    if (!videoStarted) {
      setVideoStarted(true);
      onContentReady();
    }
  }, [videoStarted, onContentReady]);

  return (
    <div>
      {/* Video content */}
      {(lessonType === "video" || lessonType === "mixed") && videoUrl && (
        <div className="mb-8">
          <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
            <video
              className="size-full object-contain"
              controls
              onPlay={handleVideoPlay}
              preload="metadata"
              src={videoUrl}
            >
              <track kind="captions" />
            </video>
          </div>
        </div>
      )}

      {/* Image content */}
      {lessonType === "image" && content && (
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-lg border">
            <NextImage
              alt="Lesson content"
              className="w-full object-contain"
              height={600}
              src={content}
              width={800}
            />
          </div>
        </div>
      )}

      {/* Article/mixed markdown content */}
      {(lessonType === "article" || lessonType === "mixed") && content && (
        <div>
          <MarkdownRenderer content={content} />
        </div>
      )}

      {/* Sentinel element for scroll detection */}
      {(lessonType === "article" ||
        lessonType === "mixed" ||
        lessonType === "image") && (
        <div aria-hidden="true" className="h-1" ref={sentinelRef} />
      )}
    </div>
  );
}
