import { relations, sql } from "drizzle-orm";
import { jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../helper";
import { user } from "./auth";

export const profileSettingsDefault = {
  enableFacehash: true,
  marketingEmails: true,
  useDeviceTimezone: true,
} as const;

export interface ProfileSettings {
  enableFacehash?: boolean;
  marketingEmails?: boolean;
  useDeviceTimezone?: boolean;
  welcomeEmailSent?: boolean;
}

export const profile = pgTable("profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  bio: text("bio").default(""),
  settings: jsonb("settings")
    .$type<ProfileSettings>()
    .default(
      sql`'{"useDeviceTimezone":true,"enableFacehash":true,"marketingEmails":true}'::jsonb`
    ),
  createdAt,
  updatedAt,
});

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
}));
