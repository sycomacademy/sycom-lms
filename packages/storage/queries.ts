import { and, eq } from "drizzle-orm";
import { db } from "@/packages/db";
import {
  type InsertMediaAsset,
  type MediaAsset,
  mediaAsset,
} from "@/packages/db/schema/storage";

/**
 * Persist an uploaded asset to the database.
 * Upserts on `publicId` — safe to call after a re-upload to the same path.
 */
export async function saveAsset(data: InsertMediaAsset): Promise<MediaAsset> {
  const [asset] = await db
    .insert(mediaAsset)
    .values(data)
    .onConflictDoUpdate({
      target: mediaAsset.publicId,
      set: {
        secureUrl: data.secureUrl,
        bytes: data.bytes,
        updatedAt: new Date(),
      },
    })
    .returning();

  return asset;
}

export async function findAssetById(id: string): Promise<MediaAsset | null> {
  const [asset] = await db
    .select()
    .from(mediaAsset)
    .where(eq(mediaAsset.id, id))
    .limit(1);

  return asset ?? null;
}

export async function findAssetByPublicId(
  publicId: string
): Promise<MediaAsset | null> {
  const [asset] = await db
    .select()
    .from(mediaAsset)
    .where(eq(mediaAsset.publicId, publicId))
    .limit(1);

  return asset ?? null;
}

/**
 * List all assets belonging to an owner.
 *
 * @param ownerType - narrow by entity type (e.g. "user", "course", "organization")
 */
export async function findAssetsByOwner(
  ownerId: string,
  ownerType?: string
): Promise<MediaAsset[]> {
  const condition = ownerType
    ? and(eq(mediaAsset.ownerId, ownerId), eq(mediaAsset.ownerType, ownerType))
    : eq(mediaAsset.ownerId, ownerId);

  return db.select().from(mediaAsset).where(condition);
}

/**
 * Hard-delete an asset record from the database.
 * Does NOT remove the file from Cloudinary — call removeAsset() first.
 */
export async function deleteAsset(id: string): Promise<MediaAsset | null> {
  const [deleted] = await db
    .delete(mediaAsset)
    .where(eq(mediaAsset.id, id))
    .returning();

  return deleted ?? null;
}
