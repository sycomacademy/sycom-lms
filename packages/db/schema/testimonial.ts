import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { course } from "./course";
import { pathway } from "./pathway";

export const testimonial = pgTable("testimonial", {
  id: text("id").primaryKey(),
  quote: text("quote").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  photoUrl: text("photo_url"),
  rating: integer("rating"),
  courseId: text("course_id").references(() => course.id, {
    onDelete: "set null",
  }),
  pathwayId: text("pathway_id").references(() => pathway.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
