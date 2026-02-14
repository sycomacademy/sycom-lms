import { S3Provider } from "./providers/s3";
import { VercelBlobProvider } from "./providers/vercel-blob";
import type { StorageConfig, StorageProvider } from "./types";

// Singleton instance cache
let storageProvider: StorageProvider | null = null;

/**
 * Get the storage provider instance
 *
 * By default, uses Vercel Blob. Pass a config to use a different provider.
 */
export function getStorageProvider(config?: StorageConfig): StorageProvider {
  if (storageProvider) {
    return storageProvider;
  }

  const providerType = config?.provider || "vercel-blob";

  switch (providerType) {
    case "vercel-blob":
      storageProvider = new VercelBlobProvider();
      break;

    case "s3":
      if (!config?.s3) {
        throw new Error("S3 configuration required for S3 provider");
      }
      storageProvider = new S3Provider(config.s3);
      break;

    default:
      throw new Error(`Unknown storage provider: ${providerType}`);
  }

  return storageProvider;
}

/**
 * Reset the storage provider instance (mainly for testing)
 */
export function resetStorageProvider(): void {
  storageProvider = null;
}
