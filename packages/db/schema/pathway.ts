import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { course } from "./course";

export const pathway = pgTable("pathway", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  estimatedDuration: integer("estimated_duration").notNull(), // total minutes
  level: text("level").notNull(), // "beginner" | "intermediate" | "advanced"
  certifications: jsonb("certifications").$type<string[]>().default([]),
  whatYoullAchieve: jsonb("what_youll_achieve").$type<string[]>().default([]),
  whoIsThisFor: jsonb("who_is_this_for").$type<string[]>().default([]),
  prerequisites: jsonb("prerequisites").$type<string[]>().default([]),
  highlights: jsonb("highlights").$type<string[]>().default([]),
  price: integer("price"), // optional bundle price in pence/cents
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pathwayCourse = pgTable("pathway_course", {
  id: text("id").primaryKey(),
  pathwayId: text("pathway_id")
    .notNull()
    .references(() => pathway.id, { onDelete: "cascade" }),
  courseId: text("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  courseOrder: integer("course_order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
