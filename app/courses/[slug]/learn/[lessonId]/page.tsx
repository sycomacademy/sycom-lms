import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { LessonPageClient } from "@/components/learn/lesson-page-client";
import { auth } from "@/packages/auth/auth";
import {
  getCourseBySlug,
  getCourseWithModules,
} from "@/packages/db/queries/course";
import { getEnrollment } from "@/packages/db/queries/enrollment";
import {
  getAllLessonsForCourse,
  getLessonById,
  getLessonWithContext,
  getQuizQuestionsForLesson,
} from "@/packages/db/queries/lesson";
import { getCompletedLessonIds } from "@/packages/db/queries/progress";

interface LessonPageProps {
  params: Promise<{ slug: string; lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(`/sign-in?redirect=/courses/${slug}/learn/${lessonId}`);
  }

  const course = await getCourseBySlug(slug);
  if (!course) {
    notFound();
  }

  // Verify enrollment
  const enrollment = await getEnrollment(session.user.id, course.id);
  if (!enrollment) {
    redirect(`/courses/${slug}`);
  }

  // Fetch lesson and course data in parallel
  const [lesson, lessonContext, modules, allLessons] = await Promise.all([
    getLessonById(lessonId),
    getLessonWithContext(lessonId),
    getCourseWithModules(course.id),
    getAllLessonsForCourse(course.id),
  ]);

  if (!(lesson && lessonContext)) {
    notFound();
  }

  // Verify lesson belongs to this course
  if (lessonContext.course.id !== course.id) {
    notFound();
  }

  // Get quiz questions if the lesson has them
  const quizQuestions = await getQuizQuestionsForLesson(lessonId);

  // Get all lesson IDs for progress lookup
  const allLessonIds = allLessons.map((l) => l.lessonId);
  const completedLessonIds = await getCompletedLessonIds(
    session.user.id,
    allLessonIds
  );

  // Find prev/next lessons
  const currentIndex = allLessons.findIndex((l) => l.lessonId === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Determine current position
  const totalLessons = allLessons.length;
  const currentLessonNumber = currentIndex + 1;

  // Check if current lesson has quiz questions
  const hasQuiz = quizQuestions.length > 0;

  return (
    <LessonPageClient
      completedLessonIds={completedLessonIds}
      course={{
        id: course.id,
        title: course.title,
        slug: course.slug,
      }}
      currentLessonNumber={currentLessonNumber}
      hasQuiz={hasQuiz}
      lesson={{
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
      }}
      modules={modules}
      navigation={{
        prev: prevLesson
          ? {
              lessonId: prevLesson.lessonId,
              title: prevLesson.lessonTitle,
            }
          : null,
        next: nextLesson
          ? {
              lessonId: nextLesson.lessonId,
              title: nextLesson.lessonTitle,
            }
          : null,
      }}
      quizQuestionIds={quizQuestions.map((q) => q.id)}
      totalLessons={totalLessons}
    />
  );
}
