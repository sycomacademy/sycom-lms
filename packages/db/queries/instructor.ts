import { eq } from "drizzle-orm";
import { db } from "@/packages/db";
import { instructor } from "@/packages/db/schema/instructor";

export async function getAllInstructors() {
  return db.select().from(instructor);
}

export async function getInstructorById(id: string) {
  const result = await db
    .select()
    .from(instructor)
    .where(eq(instructor.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getInstructorByUserId(userId: string) {
  const result = await db
    .select()
    .from(instructor)
    .where(eq(instructor.userId, userId))
    .limit(1);
  return result[0] ?? null;
}
