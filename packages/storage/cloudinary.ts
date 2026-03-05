import { v2 as cld } from "cloudinary";
import type {
  StorageFolder,
  StorageResourceType,
} from "@/packages/db/schema/storage";
import { env } from "@/packages/env/server";

cld.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const CLOUD_ROOT = "sycom-lms";

export interface SignedUploadParams {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  publicId: string;
  assetFolder: string;
}

export function buildPublicId(
  folder: StorageFolder,
  ownerId: string,
  fileId = crypto.randomUUID()
): string {
  return `${CLOUD_ROOT}/${folder}/${ownerId}/${fileId}`;
}

export function signUploadParams(
  folder: StorageFolder,
  ownerId: string
): SignedUploadParams {
  const publicId = buildPublicId(folder, ownerId);
  const assetFolder = `${CLOUD_ROOT}/${folder}/${ownerId}`;
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cld.utils.api_sign_request(
    { asset_folder: assetFolder, public_id: publicId, timestamp },
    env.CLOUDINARY_API_SECRET
  );

  return {
    uploadUrl: cld.utils.api_url("upload", { resource_type: "auto" }),
    apiKey: env.CLOUDINARY_API_KEY,
    timestamp,
    signature,
    publicId,
    assetFolder,
  };
}

export async function removeAsset(
  publicId: string,
  options?: { resourceType?: StorageResourceType; invalidate?: boolean }
): Promise<{ result: string }> {
  return cld.uploader.destroy(publicId, {
    resource_type: options?.resourceType ?? "image",
    invalidate: options?.invalidate ?? true,
  });
}

export function getPublicUrl(
  publicId: string,
  resourceType: StorageResourceType = "image"
): string {
  return cld.url(publicId, { resource_type: resourceType, secure: true });
}

export async function getSignedUrl(
  publicId: string,
  expireIn: number,
  options?: { download?: boolean; resourceType?: StorageResourceType }
): Promise<string> {
  return cld.utils.private_download_url(publicId, "", {
    resource_type: options?.resourceType ?? "image",
    attachment: options?.download ?? false,
    expires_at: Math.round(Date.now() / 1000) + expireIn,
  });
}
