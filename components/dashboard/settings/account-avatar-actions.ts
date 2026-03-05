"use server";

import { getSession } from "@/packages/auth/helper";
import type { SignedUploadParams } from "@/packages/storage/cloudinary";
import { signUploadParams } from "@/packages/storage/cloudinary";
import { saveAsset } from "@/packages/storage/queries";
import type { UploadResult } from "@/packages/storage/upload";

export async function getAvatarUploadParams(): Promise<SignedUploadParams | null> {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }
  return signUploadParams("avatars", session.user.id);
}

export async function persistAvatarAsset(
  result: UploadResult
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }
  try {
    await saveAsset({
      publicId: result.publicId,
      secureUrl: result.secureUrl,
      folder: "avatars",
      resourceType: result.resourceType,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      ownerId: session.user.id,
      ownerType: "user",
      uploadedBy: session.user.id,
    });
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save asset";
    return { success: false, error: message };
  }
}
