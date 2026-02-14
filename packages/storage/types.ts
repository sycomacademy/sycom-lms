/**
 * Storage Provider Interface
 *
 * This interface defines the contract for storage providers (Vercel Blob, S3, MinIO, etc.)
 * to ensure compatibility and easy switching between providers.
 */

export interface StorageProvider {
  /** Provider name identifier */
  readonly name: string;

  /**
   * Upload a file to storage
   */
  upload(params: UploadParams): Promise<UploadResult>;

  /**
   * Delete a file from storage
   */
  delete(url: string): Promise<void>;

  /**
   * Check if a file exists in storage
   */
  exists(url: string): Promise<boolean>;

  /**
   * Get a public URL for a file
   */
  getPublicUrl(key: string): string;

  /**
   * Get a signed/presigned URL for private file access
   * @param url - The file URL or key
   * @param expiresIn - Expiration time in seconds (default: 3600)
   */
  getSignedUrl(url: string, expiresIn?: number): Promise<string>;

  /**
   * Create a client upload token/URL for direct browser uploads
   * Required for providers that support direct client uploads
   */
  createClientUploadToken?(
    params: CreateClientUploadParams
  ): Promise<ClientUploadToken>;
}

export interface UploadParams {
  /** Storage key/path for the file */
  key: string;
  /** File content */
  body: Buffer | Blob | ReadableStream;
  /** MIME type */
  contentType: string;
  /** Custom metadata */
  metadata?: Record<string, string>;
  /** File visibility */
  visibility?: "public" | "private";
}

export interface UploadResult {
  /** Public URL of the uploaded file */
  url: string;
  /** Storage key/path */
  key: string;
  /** File size in bytes */
  size: number;
}

export interface CreateClientUploadParams {
  /** Storage key/path for the file */
  key: string;
  /** Expected MIME type */
  contentType: string;
  /** Maximum file size in bytes */
  maxSize: number;
  /** Token expiration in seconds */
  expiresIn?: number;
}

export interface ClientUploadToken {
  /** Token or URL for client upload */
  token: string;
  /** URL to upload to (if different from token) */
  uploadUrl?: string;
  /** HTTP method to use */
  method: "PUT" | "POST";
  /** Headers to include in the upload request */
  headers?: Record<string, string>;
  /** Form fields for multipart uploads (S3 presigned POST) */
  fields?: Record<string, string>;
  /** When the token expires */
  expiresAt: Date;
}

/**
 * Storage configuration for different providers
 */
export interface StorageConfig {
  provider: "vercel-blob" | "s3";
  // S3-specific config (for future use)
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string; // For S3-compatible services
  };
}
