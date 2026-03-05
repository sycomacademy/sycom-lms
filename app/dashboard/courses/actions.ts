"use server";

import { getSession, instructorGuard } from "@/packages/auth/helper";
import type { StorageFolder } from "@/packages/db/schema/storage";
import { signUploadParams } from "@/packages/storage/cloudinary";
import { saveAsset } from "@/packages/storage/queries";
import type { UploadResult } from "@/packages/storage/upload";

const THUMBNAILS_FOLDER = "thumbnails" satisfies StorageFolder;

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
