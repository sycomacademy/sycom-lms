import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  jobTitle: text("job_title"),
  company: text("company"),
  location: text("location"),
  website: text("website"),
  linkedinUrl: text("linkedin_url"),
  twitterHandle: text("twitter_handle"),
  settings: jsonb("settings").$type<ProfileSettings>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export interface ProfileSettings {
  theme?: "light" | "dark" | "system";
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  courseReminders?: boolean;
  weeklyDigest?: boolean;
}
