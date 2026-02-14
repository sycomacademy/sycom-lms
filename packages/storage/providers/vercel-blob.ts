import { del, head, put } from "@vercel/blob";
import type {
  ClientUploadToken,
  CreateClientUploadParams,
  StorageProvider,
  UploadParams,
  UploadResult,
} from "../types";

/**
 * Vercel Blob Storage Provider
 *
 * Uses Vercel Blob for file storage with support for:
 * - Server-side uploads
 * - Client-side uploads with tokens
 * - Public URLs (Vercel Blob doesn't support private files natively)
 */
export class VercelBlobProvider implements StorageProvider {
  readonly name = "vercel-blob";

  async upload(params: UploadParams): Promise<UploadResult> {
    const blob = await put(params.key, params.body, {
      access: "public", // Vercel Blob only supports public access
      contentType: params.contentType,
      addRandomSuffix: false,
    });

    // Get the file size from head request since put doesn't return it
    let size = 0;
    try {
      const headResult = await head(blob.url);
      size = headResult.size;
    } catch {
      // If head fails, we'll use 0 as fallback
    }

    return {
      url: blob.url,
      key: params.key,
      size,
    };
  }

  async delete(url: string): Promise<void> {
    await del(url);
  }

  async exists(url: string): Promise<boolean> {
    try {
      await head(url);
      return true;
    } catch {
      return false;
    }
  }

  getPublicUrl(key: string): string {
    // For Vercel Blob, the URL is returned from upload
    // This is a fallback that won't work without the full URL
    return key;
  }

  async getSignedUrl(url: string, _expiresIn?: number): Promise<string> {
    // Vercel Blob doesn't support signed URLs
    // All files are public, so we just return the URL
    return url;
  }

  async createClientUploadToken(
    params: CreateClientUploadParams
  ): Promise<ClientUploadToken> {
    // Generate a unique token for this upload
    const token = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + (params.expiresIn || 30 * 60) * 1000
    );

    // For Vercel Blob, we'll use a server-side endpoint to handle the upload
    // The token will be validated server-side
    return {
      token,
      uploadUrl: `/api/storage/upload?token=${token}`,
      method: "PUT",
      headers: {
        "Content-Type": params.contentType,
      },
      expiresAt,
    };
  }
}
