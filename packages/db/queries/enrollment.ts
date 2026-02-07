import { and, desc, eq } from "drizzle-orm";
import { db } from "@/packages/db";
import { course } from "@/packages/db/schema/course";
import { enrollment, wishlist } from "@/packages/db/schema/enrollment";

// ─── Enrollment Queries ────────────────────────────────────

export async function getEnrollmentsByUserId(userId: string) {
  return db
    .select({
      enrollment,
      course,
    })
    .from(enrollment)
    .innerJoin(course, eq(enrollment.courseId, course.id))
    .where(eq(enrollment.userId, userId))
    .orderBy(desc(enrollment.enrolledAt));
}

export async function getEnrollment(userId: string, courseId: string) {
  const result = await db
    .select()
    .from(enrollment)
    .where(
      and(eq(enrollment.userId, userId), eq(enrollment.courseId, courseId))
    )
    .limit(1);
  return result[0] ?? null;
}

export async function createEnrollment(data: {
  id: string;
  userId: string;
  courseId: string;
}) {
  const result = await db.insert(enrollment).values(data).returning();
  return result[0];
}

export async function deleteEnrollment(userId: string, courseId: string) {
  return db
    .delete(enrollment)
    .where(
      and(eq(enrollment.userId, userId), eq(enrollment.courseId, courseId))
    );
}

// ─── Wishlist Queries ──────────────────────────────────────

export async function getWishlistByUserId(userId: string) {
  return db
    .select({
      wishlist,
      course,
    })
    .from(wishlist)
    .innerJoin(course, eq(wishlist.courseId, course.id))
    .where(eq(wishlist.userId, userId))
    .orderBy(desc(wishlist.addedAt));
}

export async function getWishlistItem(userId: string, courseId: string) {
  const result = await db
    .select()
    .from(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.courseId, courseId)))
    .limit(1);
  return result[0] ?? null;
}

export async function addToWishlist(data: {
  id: string;
  userId: string;
  courseId: string;
}) {
  const result = await db.insert(wishlist).values(data).returning();
  return result[0];
}

export async function removeFromWishlist(userId: string, courseId: string) {
  return db
    .delete(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.courseId, courseId)));
}
