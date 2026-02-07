import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/packages/auth/auth";
import { getCourseBySlug } from "@/packages/db/queries/course";
import { getEnrollment } from "@/packages/db/queries/enrollment";
import { getNextLessonForUser } from "@/packages/db/queries/lesson";

interface LearnRedirectPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Redirects to the first lesson in the course, or the first incomplete lesson.
 */
export default async function LearnRedirectPage({
  params,
}: LearnRedirectPageProps) {
  const { slug } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(`/sign-in?redirect=/courses/${slug}`);
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

  const next = await getNextLessonForUser(session.user.id, course.id);
  if (!next) {
    redirect(`/courses/${slug}`);
  }

  redirect(`/courses/${slug}/learn/${next.lessonId}`);
}
