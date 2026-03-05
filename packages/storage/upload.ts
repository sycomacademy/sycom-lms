/**
 * Browser-only. Import directly:
 * import { uploadFile } from "@/packages/storage/upload"
 */

import type { StorageResourceType } from "@/packages/db/schema/storage";
import type { SignedUploadParams } from "./cloudinary";

export interface UploadResult {
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  resourceType: StorageResourceType;
}

export function uploadFile({
  file,
  signedParams,
  onProgress,
}: {
  file: File;
  signedParams: SignedUploadParams;
  onProgress?: (progress: number) => void;
}): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signedParams.apiKey);
  formData.append("timestamp", String(signedParams.timestamp));
  formData.append("signature", signedParams.signature);
  formData.append("public_id", signedParams.publicId);
  formData.append("asset_folder", signedParams.assetFolder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", signedParams.uploadUrl, true);

    if (onProgress) {
      xhr.upload.onprogress = ({ loaded, total, lengthComputable }) => {
        if (lengthComputable) {
          onProgress(Math.min(100, Math.round((loaded / total) * 100)));
        }
      };
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as {
          secure_url?: string;
          public_id?: string;
          format?: string;
          bytes?: number;
          width?: number;
          height?: number;
          resource_type?: string;
          error?: { message?: string };
        };

        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve({
            secureUrl: data.secure_url,
            publicId: data.public_id ?? "",
            format: data.format ?? "",
            bytes: data.bytes ?? 0,
            width: data.width,
            height: data.height,
            resourceType: (data.resource_type ?? "file") as StorageResourceType,
          });
        } else {
          reject(new Error(data.error?.message ?? "Cloudinary upload failed"));
        }
      } catch {
        reject(new Error("Invalid Cloudinary response"));
      }
    };

    xhr.onerror = () => reject(new Error("Cloudinary upload network error"));
    xhr.send(formData);
  });
}
