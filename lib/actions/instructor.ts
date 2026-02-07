"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/packages/auth/auth";
import {
  createCourse,
  createLesson,
  createModule,
  createSection,
  deleteLesson,
  deleteModule,
  deleteSection,
  getCourseById,
  getMaxLessonOrder,
  getMaxModuleOrder,
  getMaxSectionOrder,
  reorderLessons,
  reorderModules,
  reorderSections,
  updateCourse,
  updateLesson,
  updateModule,
  updateSection,
} from "@/packages/db/queries/course";
import { getInstructorByUserId } from "@/packages/db/queries/instructor";
import {
  addCourseToPathway,
  createPathway,
  getMaxPathwayCourseOrder,
  getPathwayById,
  removeCourseFromPathway,
  reorderPathwayCourses,
  updatePathway,
} from "@/packages/db/queries/pathway";

async function requireInstructor() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/sign-in");
  }
  const instructor = await getInstructorByUserId(session.user.id);
  if (!instructor) {
    redirect("/dashboard");
  }
  return instructor;
}

async function requireCourseOwnership(courseId: string) {
  const instructor = await requireInstructor();
  const c = await getCourseById(courseId);
  if (!c || c.instructorId !== instructor.id) {
    throw new Error("Course not found or access denied");
  }
  return { instructor, course: c };
}

export async function createCourseAction(formData: FormData) {
  const instructor = await requireInstructor();
  const title = formData.get("title") as string;
  const slug =
    (formData.get("slug") as string)
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, "-") ?? "";
  const description = (formData.get("description") as string) ?? "";
  const shortDescription = (formData.get("shortDescription") as string) ?? "";
  const category = (formData.get("category") as string) ?? "";
  const level = (formData.get("level") as string) ?? "beginner";
  const price = Number(formData.get("price")) || 0;
  const duration = Number(formData.get("duration")) || 0;
  const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null;
  const id = nanoid();
  await createCourse({
    id,
    title: title || "Untitled",
    slug: slug || `course-${id.slice(0, 8)}`,
    description,
    shortDescription: shortDescription || description.slice(0, 200),
    category,
    level,
    price,
    duration,
    instructorId: instructor.id,
    thumbnailUrl,
    whatYoullLearn: [],
    prerequisites: [],
    whoIsThisFor: [],
    highlights: [],
  });
  redirect(`/instructor/courses/${id}/edit`);
}

export async function updateCourseAction(courseId: string, formData: FormData) {
  await requireCourseOwnership(courseId);
  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string)
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const description = formData.get("description") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const category = formData.get("category") as string;
  const level = formData.get("level") as string;
  const price = Number(formData.get("price"));
  const duration = Number(formData.get("duration"));
  const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null;
  await updateCourse(courseId, {
    title,
    slug,
    description,
    shortDescription,
    category,
    level,
    price,
    duration,
    thumbnailUrl,
  });
  revalidatePath(`/instructor/courses/${courseId}/edit`);
  revalidatePath("/instructor");
  revalidatePath("/instructor/courses");
}

export async function createModuleAction(courseId: string, title: string) {
  await requireCourseOwnership(courseId);
  const order = await getMaxModuleOrder(courseId);
  const id = nanoid();
  await createModule({
    id,
    courseId,
    title: title || "Untitled module",
    order,
  });
  return id;
}

export async function updateModuleAction(
  courseId: string,
  moduleId: string,
  data: { title?: string }
) {
  await requireCourseOwnership(courseId);
  await updateModule(moduleId, data);
}

export async function deleteModuleAction(courseId: string, moduleId: string) {
  await requireCourseOwnership(courseId);
  await deleteModule(moduleId);
}

export async function reorderModulesAction(
  courseId: string,
  orderedIds: string[]
) {
  await requireCourseOwnership(courseId);
  await reorderModules(courseId, orderedIds);
}

export async function createSectionAction(
  moduleId: string,
  courseId: string,
  title: string
) {
  await requireCourseOwnership(courseId);
  const order = await getMaxSectionOrder(moduleId);
  const id = nanoid();
  await createSection({
    id,
    moduleId,
    title: title || "Untitled section",
    order,
  });
  return id;
}

export async function updateSectionAction(
  courseId: string,
  sectionId: string,
  data: { title?: string }
) {
  await requireCourseOwnership(courseId);
  await updateSection(sectionId, data);
}

export async function deleteSectionAction(courseId: string, sectionId: string) {
  await requireCourseOwnership(courseId);
  await deleteSection(sectionId);
}

export async function reorderSectionsAction(
  courseId: string,
  moduleId: string,
  orderedIds: string[]
) {
  await requireCourseOwnership(courseId);
  await reorderSections(moduleId, orderedIds);
}

export async function createLessonAction(
  courseId: string,
  sectionId: string,
  data: {
    title: string;
    type: string;
    duration: number;
    content?: string | null;
    videoUrl?: string | null;
  }
) {
  await requireCourseOwnership(courseId);
  const order = await getMaxLessonOrder(sectionId);
  const id = nanoid();
  await createLesson({
    id,
    sectionId,
    title: data.title || "Untitled lesson",
    order,
    type: data.type || "article",
    duration: data.duration ?? 0,
    content: data.content ?? null,
    videoUrl: data.videoUrl ?? null,
  });
  return id;
}

export async function updateLessonAction(
  courseId: string,
  lessonId: string,
  data: {
    title?: string;
    type?: string;
    duration?: number;
    content?: string | null;
    videoUrl?: string | null;
  }
) {
  await requireCourseOwnership(courseId);
  await updateLesson(lessonId, data);
}

export async function deleteLessonAction(courseId: string, lessonId: string) {
  await requireCourseOwnership(courseId);
  await deleteLesson(lessonId);
}

export async function reorderLessonsAction(
  courseId: string,
  sectionId: string,
  orderedIds: string[]
) {
  await requireCourseOwnership(courseId);
  await reorderLessons(sectionId, orderedIds);
}

// ——— Pathways (all instructors can edit) ———

export async function createPathwayAction(formData: FormData) {
  await requireInstructor();
  const title = formData.get("title") as string;
  const slug =
    (formData.get("slug") as string)
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, "-") ?? "";
  const description = (formData.get("description") as string) ?? "";
  const shortDescription = (formData.get("shortDescription") as string) ?? "";
  const estimatedDuration = Number(formData.get("estimatedDuration")) || 0;
  const level = (formData.get("level") as string) ?? "beginner";
  const price = formData.get("price") ? Number(formData.get("price")) : null;
  const id = nanoid();
  await createPathway({
    id,
    title: title || "Untitled pathway",
    slug: slug || `pathway-${id.slice(0, 8)}`,
    description,
    shortDescription: shortDescription || description.slice(0, 200),
    estimatedDuration,
    level,
    price,
    certifications: [],
    whatYoullAchieve: [],
    whoIsThisFor: [],
    prerequisites: [],
    highlights: [],
  });
  redirect(`/instructor/pathways/${id}/edit`);
}

export async function updatePathwayAction(
  pathwayId: string,
  formData: FormData
) {
  await requireInstructor();
  const p = await getPathwayById(pathwayId);
  if (!p) {
    throw new Error("Pathway not found");
  }
  const title = formData.get("title") as string;
  const slug = (formData.get("slug") as string)
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const description = formData.get("description") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const estimatedDuration = Number(formData.get("estimatedDuration"));
  const level = formData.get("level") as string;
  const price = formData.get("price") ? Number(formData.get("price")) : null;
  await updatePathway(pathwayId, {
    title,
    slug,
    description,
    shortDescription,
    estimatedDuration,
    level,
    price,
  });
  revalidatePath(`/instructor/pathways/${pathwayId}/edit`);
  revalidatePath("/instructor");
  revalidatePath("/instructor/pathways");
}

export async function addCourseToPathwayAction(
  pathwayId: string,
  courseId: string
) {
  await requireInstructor();
  const p = await getPathwayById(pathwayId);
  if (!p) {
    throw new Error("Pathway not found");
  }
  const order = await getMaxPathwayCourseOrder(pathwayId);
  const id = nanoid();
  await addCourseToPathway({ id, pathwayId, courseId, courseOrder: order });
}

export async function removeCourseFromPathwayAction(
  pathwayId: string,
  courseId: string
) {
  await requireInstructor();
  await removeCourseFromPathway(pathwayId, courseId);
}

export async function reorderPathwayCoursesAction(
  pathwayId: string,
  orderedCourseIds: string[]
) {
  await requireInstructor();
  await reorderPathwayCourses(pathwayId, orderedCourseIds);
}
