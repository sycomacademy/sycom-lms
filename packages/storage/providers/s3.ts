import type {
  ClientUploadToken,
  CreateClientUploadParams,
  StorageConfig,
  StorageProvider,
  UploadParams,
  UploadResult,
} from "../types";

/**
 * S3 Storage Provider (Stub)
 *
 * This is a stub implementation for future S3/S3-compatible storage support.
 * Compatible with:
 * - AWS S3
 * - MinIO
 * - Cloudflare R2
 * - DigitalOcean Spaces
 * - Backblaze B2
 *
 * To implement:
 * 1. Install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner
 * 2. Implement the methods below using the SDK
 */
export class S3Provider implements StorageProvider {
  readonly name = "s3";

  private readonly config: NonNullable<StorageConfig["s3"]>;

  constructor(config: NonNullable<StorageConfig["s3"]>) {
    this.config = config;
  }

  async upload(_params: UploadParams): Promise<UploadResult> {
    throw new Error(
      "S3 provider not implemented. Install @aws-sdk/client-s3 and implement this method."
    );

    // Implementation example:
    // const client = new S3Client({
    //   region: this.config.region,
    //   credentials: {
    //     accessKeyId: this.config.accessKeyId,
    //     secretAccessKey: this.config.secretAccessKey,
    //   },
    //   ...(this.config.endpoint && { endpoint: this.config.endpoint }),
    // });
    //
    // await client.send(new PutObjectCommand({
    //   Bucket: this.config.bucket,
    //   Key: params.key,
    //   Body: params.body,
    //   ContentType: params.contentType,
    //   Metadata: params.metadata,
    // }));
    //
    // return {
    //   url: `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${params.key}`,
    //   key: params.key,
    //   size: params.body.length,
    // };
  }

  async delete(_url: string): Promise<void> {
    throw new Error(
      "S3 provider not implemented. Install @aws-sdk/client-s3 and implement this method."
    );
  }

  async exists(_url: string): Promise<boolean> {
    throw new Error(
      "S3 provider not implemented. Install @aws-sdk/client-s3 and implement this method."
    );
  }

  getPublicUrl(key: string): string {
    // Standard S3 URL format
    if (this.config.endpoint) {
      return `${this.config.endpoint}/${this.config.bucket}/${key}`;
    }
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
  }

  async getSignedUrl(_url: string, _expiresIn?: number): Promise<string> {
    throw new Error(
      "S3 provider not implemented. Install @aws-sdk/s3-request-presigner and implement this method."
    );

    // Implementation example:
    // const client = new S3Client({ ... });
    // const command = new GetObjectCommand({
    //   Bucket: this.config.bucket,
    //   Key: extractKeyFromUrl(url),
    // });
    // return getSignedUrl(client, command, { expiresIn: expiresIn || 3600 });
  }

  async createClientUploadToken(
    _params: CreateClientUploadParams
  ): Promise<ClientUploadToken> {
    throw new Error(
      "S3 provider not implemented. Install @aws-sdk/s3-request-presigner and implement this method."
    );

    // Implementation example (presigned POST):
    // const { url, fields } = await createPresignedPost(client, {
    //   Bucket: this.config.bucket,
    //   Key: params.key,
    //   Conditions: [
    //     ['content-length-range', 0, params.maxSize],
    //     ['eq', '$Content-Type', params.contentType],
    //   ],
    //   Expires: params.expiresIn || 3600,
    // });
    //
    // return {
    //   token: fields.key,
    //   uploadUrl: url,
    //   method: 'POST',
    //   fields,
    //   expiresAt: new Date(Date.now() + (params.expiresIn || 3600) * 1000),
    // };
  }
}
