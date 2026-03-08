"use server";

import { getSession } from "@/packages/auth/helper";
import type { SignedUploadParams } from "@/packages/storage/cloudinary";
import { signUploadParams } from "@/packages/storage/cloudinary";
import { saveAsset } from "@/packages/storage/queries";
import type { UploadResult } from "@/packages/storage/upload";

export async function getCohortImageUploadParams(
  cohortId: string
): Promise<SignedUploadParams | null> {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }
  return signUploadParams("thumbnails", cohortId);
}

export async function persistCohortImageAsset(
  result: UploadResult,
  cohortId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }
  try {
    await saveAsset({
      publicId: result.publicId,
      secureUrl: result.secureUrl,
      folder: "thumbnails",
      resourceType: result.resourceType,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      entityId: cohortId,
      entityType: "cohort",
      uploadedBy: session.user.id,
    });
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save asset";
    return { success: false, error: message };
  }
}
