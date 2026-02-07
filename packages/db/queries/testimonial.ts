import { eq } from "drizzle-orm";
import { db } from "@/packages/db";
import { testimonial } from "@/packages/db/schema/testimonial";

export async function getAllTestimonials() {
  return db.select().from(testimonial);
}

export async function getTestimonialsForCourse(courseId: string) {
  return db
    .select()
    .from(testimonial)
    .where(eq(testimonial.courseId, courseId));
}

export async function getTestimonialsForPathway(pathwayId: string) {
  return db
    .select()
    .from(testimonial)
    .where(eq(testimonial.pathwayId, pathwayId));
}
