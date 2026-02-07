import { eq } from "drizzle-orm";
import { db } from "@/packages/db";
import { fileMetadata } from "@/packages/db/schema/file-metadata";

export async function createFileMetadata(data: {
  id: string;
  url: string;
  pathname: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedById?: string;
  metadata?: Record<string, unknown>;
}) {
  const result = await db.insert(fileMetadata).values(data).returning();
  return result[0];
}

export async function getFileMetadataById(id: string) {
  const result = await db
    .select()
    .from(fileMetadata)
    .where(eq(fileMetadata.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getFileMetadataByUrl(url: string) {
  const result = await db
    .select()
    .from(fileMetadata)
    .where(eq(fileMetadata.url, url))
    .limit(1);
  return result[0] ?? null;
}
