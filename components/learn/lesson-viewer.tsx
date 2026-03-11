"use client";

import type { JSONContent } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "@/components/editor/editor";
import { cn } from "@/packages/utils/cn";
import { QuizCompletionProvider } from "./quiz-completion-context";

function countQuizBlocks(content: JSONContent | null | undefined): number {
  if (!content) {
    return 0;
  }
  let n = content.type === "quizBlock" ? 1 : 0;
  for (const child of content.content ?? []) {
    n += countQuizBlocks(child);
  }
  return n;
}

export interface LessonRequirements {
  scrollReachedEnd: boolean;
  quizSatisfied: boolean;
  hasQuizBlocks: boolean;
  scrollToQuiz: () => void;
}

export function LessonViewer({
  className,
  content,
  onRequirementsChange,
}: {
  className?: string;
  content: JSONContent | null | undefined;
  onRequirementsChange?: (req: LessonRequirements) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [scrollReachedEnd, setScrollReachedEnd] = useState(false);
  const scrollReachedEndRef = useRef(false);
  const lastScrollHeightRef = useRef(0);
  const requiredQuizCount = countQuizBlocks(content);
  const hasQuizBlocks = requiredQuizCount > 0;
  const [quizSatisfied, setQuizSatisfied] = useState(!hasQuizBlocks);

  useEffect(() => {
    if (hasQuizBlocks) {
      setQuizSatisfied(false);
    } else {
      setQuizSatisfied(true);
    }
  }, [hasQuizBlocks]);

  const scrollToQuiz = useCallback(() => {
    const root = scrollRef.current;
    if (!root) {
      return;
    }
    const quizBlock = root.querySelector('[data-type="quiz-block"]');
    if (quizBlock) {
      quizBlock.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  useEffect(() => {
    onRequirementsChange?.({
      hasQuizBlocks,
      quizSatisfied: hasQuizBlocks ? quizSatisfied : true,
      scrollReachedEnd,
      scrollToQuiz,
    });
  }, [
    hasQuizBlocks,
    quizSatisfied,
    scrollReachedEnd,
    scrollToQuiz,
    onRequirementsChange,
  ]);

  const handleReachedEndChange = useCallback((atEnd: boolean) => {
    const root = scrollRef.current;
    if (!root) {
      return;
    }

    if (atEnd) {
      lastScrollHeightRef.current = root.scrollHeight;
      scrollReachedEndRef.current = true;
      setScrollReachedEnd(true);
    } else if (scrollReachedEndRef.current) {
      const heightGrew = root.scrollHeight > lastScrollHeightRef.current + 100;
      if (heightGrew) {
        lastScrollHeightRef.current = root.scrollHeight;
        scrollReachedEndRef.current = false;
        setScrollReachedEnd(false);
      }
    }
  }, []);

  const handleAllQuizCorrectChange = useCallback((allCorrect: boolean) => {
    setQuizSatisfied(allCorrect);
  }, []);

  let editorContent: React.ReactNode;
  if (content) {
    if (hasQuizBlocks) {
      editorContent = (
        <QuizCompletionProvider
          onAllCorrectChange={handleAllQuizCorrectChange}
          requiredCount={requiredQuizCount}
        >
          <div className="prose prose-neutral dark:prose-invert max-w-none p-4 [&_.editor-content]:min-h-0 [&_.editor-content]:p-0">
            <Editor content={content} editable={false} variant="full" />
          </div>
        </QuizCompletionProvider>
      );
    } else {
      editorContent = (
        <div className="prose prose-neutral dark:prose-invert max-w-none p-4 [&_.editor-content]:min-h-0 [&_.editor-content]:p-0">
          <Editor content={content} editable={false} variant="full" />
        </div>
      );
    }
  } else {
    editorContent = (
      <p className="text-muted-foreground text-sm">
        No content for this lesson.
      </p>
    );
  }

  useEffect(() => {
    const root = scrollRef.current;
    const end = endRef.current;
    if (!(root && end)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextAtEnd = entry?.isIntersecting === true;
        handleReachedEndChange(nextAtEnd);
      },
      { root, threshold: 0.1 }
    );

    observer.observe(end);
    return () => observer.disconnect();
  }, [handleReachedEndChange]);

  return (
    <div
      className={cn("h-full min-h-0 overflow-y-auto px-6 py-6", className)}
      ref={scrollRef}
    >
      {editorContent}
      <div className="h-10" ref={endRef} />
      <div aria-live="polite" className="sr-only">
        {scrollReachedEnd
          ? "Reached end of lesson."
          : "Not yet at end of lesson."}
      </div>
    </div>
  );
}
