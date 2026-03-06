"use server";

import { getSession, instructorGuard } from "@/packages/auth/helper";
import type { StorageFolder } from "@/packages/db/schema/storage";
import { signUploadParams } from "@/packages/storage/cloudinary";
import { saveAsset } from "@/packages/storage/queries";
import type { UploadResult } from "@/packages/storage/upload";

const THUMBNAILS_FOLDER = "thumbnails" satisfies StorageFolder;
const COURSE_CONTENT_FOLDER = "course-content" satisfies StorageFolder;

/**
 * Get signed upload params for a course thumbnail.
 * courseId can be "new" when creating a course.
 */
export async function getCourseThumbnailSignedParams(courseId: string) {
  await instructorGuard();
  return signUploadParams(THUMBNAILS_FOLDER, courseId);
}

/**
 * Persist an uploaded course thumbnail to the media_asset table.
 */
export async function persistCourseThumbnail(
  result: UploadResult,
  courseId: string
) {
  await instructorGuard();
  const session = await getSession();
  return saveAsset({
    publicId: result.publicId,
    secureUrl: result.secureUrl,
    folder: THUMBNAILS_FOLDER,
    resourceType: result.resourceType,
    format: result.format,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
    ownerId: courseId,
    ownerType: "course",
    uploadedBy: session?.user?.id ?? undefined,
  });
}

/**
 * Get signed upload params for lesson media (images, video, audio, files).
 * Uses lessonId for folder organization; for drafts use courseId as ownerId.
 */
export async function getLessonMediaSignedParams(ownerId: string) {
  await instructorGuard();
  return signUploadParams(COURSE_CONTENT_FOLDER, ownerId);
}

/**
 * Persist uploaded lesson media to the media_asset table.
 */
export async function persistLessonMedia(
  result: UploadResult,
  lessonId: string
) {
  await instructorGuard();
  const session = await getSession();
  return saveAsset({
    publicId: result.publicId,
    secureUrl: result.secureUrl,
    folder: COURSE_CONTENT_FOLDER,
    resourceType: result.resourceType,
    format: result.format,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
    ownerId: lessonId,
    ownerType: "lesson",
    uploadedBy: session?.user?.id ?? undefined,
  });
}
