import { put } from "@vercel/blob";

interface UploadOptions {
  /** Path prefix for the blob (e.g. "avatars", "courses/thumbnails") */
  pathPrefix?: string;
  /** Access level. Defaults to "public" */
  access?: "public";
}

interface UploadResult {
  url: string;
  pathname: string;
  size: number;
  contentType: string;
}

/**
 * Upload a file to Vercel Blob storage.
 * Returns the public URL and metadata.
 */
export async function uploadFile(
  filename: string,
  body: File | Blob | ReadableStream | ArrayBuffer | string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { pathPrefix, access = "public" } = options;
  const pathname = pathPrefix ? `${pathPrefix}/${filename}` : filename;

  const blob = await put(pathname, body, {
    access,
    allowOverwrite: true,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    size: blob.contentType ? 0 : 0, // size comes from the file itself
    contentType: blob.contentType ?? "application/octet-stream",
  };
}
