import { eq } from "drizzle-orm";
import { db } from "@/packages/db";
import { user } from "@/packages/db/schema/auth";

/**
 * Get a user by ID
 */
export async function getUserById(id: string) {
  const result = await db.select().from(user).where(eq(user.id, id)).limit(1);

  return result[0] ?? null;
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Check if email exists
 */
export async function emailExists(email: string) {
  const result = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  return result.length > 0;
}

/**
 * Update user's email verification status
 */
export async function setEmailVerified(userId: string, verified: boolean) {
  const result = await db
    .update(user)
    .set({
      emailVerified: verified,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();

  return result[0] ?? null;
}
