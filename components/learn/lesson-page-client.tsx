"use client";

import { useCallback, useState } from "react";
import { CourseSidebar } from "@/components/learn/course-sidebar";
import { LessonContent } from "@/components/learn/lesson-content";
import { LessonNavigation } from "@/components/learn/lesson-navigation";
import { LessonQuiz } from "@/components/learn/lesson-quiz";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface Module {
  id: string;
  title: string;
  order: number;
  sections: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      order: number;
      type: string;
      duration: number;
    }[];
  }[];
}

interface LessonPageClientProps {
  course: {
    id: string;
    title: string;
    slug: string;
  };
  lesson: {
    id: string;
    title: string;
    type: string;
    content: string | null;
    videoUrl: string | null;
    duration: number;
  };
  modules: Module[];
  completedLessonIds: string[];
  navigation: {
    prev: { lessonId: string; title: string } | null;
    next: { lessonId: string; title: string } | null;
  };
  currentLessonNumber: number;
  totalLessons: number;
  hasQuiz: boolean;
  quizQuestionIds: string[];
}

export function LessonPageClient({
  course,
  lesson,
  modules,
  completedLessonIds,
  navigation,
  currentLessonNumber,
  totalLessons,
  hasQuiz,
  quizQuestionIds,
}: LessonPageClientProps) {
  const [canComplete, setCanComplete] = useState(false);
  const isCompleted = completedLessonIds.includes(lesson.id);

  const handleContentReady = useCallback(() => {
    // Called when article is scrolled to bottom or video has started
    if (!hasQuiz) {
      setCanComplete(true);
    }
  }, [hasQuiz]);

  const handleQuizComplete = useCallback(() => {
    setCanComplete(true);
  }, []);

  return (
    <SidebarProvider>
      <CourseSidebar
        completedLessonIds={completedLessonIds}
        courseSlug={course.slug}
        courseTitle={course.title}
        currentLessonId={lesson.id}
        modules={modules}
      />
      <SidebarInset>
        <div className="flex h-dvh flex-col">
          {/* Lesson Header */}
          <header className="flex h-14 shrink-0 items-center gap-4 border-b px-6">
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-semibold text-sm">{lesson.title}</h1>
              <p className="text-muted-foreground text-xs">
                Lesson {currentLessonNumber} of {totalLessons}
              </p>
            </div>
          </header>

          {/* Main Lesson Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl px-6 py-8">
              <LessonContent
                content={lesson.content}
                lessonType={lesson.type}
                onContentReady={handleContentReady}
                videoUrl={lesson.videoUrl}
              />

              {hasQuiz && (
                <div className="mt-8">
                  <LessonQuiz
                    lessonId={lesson.id}
                    onQuizComplete={handleQuizComplete}
                    questionIds={quizQuestionIds}
                  />
                </div>
              )}
            </div>
          </main>

          {/* Bottom Navigation */}
          <LessonNavigation
            canComplete={canComplete || isCompleted}
            courseSlug={course.slug}
            isCompleted={isCompleted}
            lessonId={lesson.id}
            navigation={navigation}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
