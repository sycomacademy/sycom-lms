import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../helper";
import { user, userRoleEnum } from "./auth";

export const publicInvite = pgTable(
  "public_invite",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: userRoleEnum("role").notNull(),
    tokenHash: text("token_hash").notNull(),
    status: text("status", {
      enum: ["pending", "accepted", "revoked"],
    })
      .default("pending")
      .notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    revokedAt: timestamp("revoked_at"),
    acceptedUserId: text("accepted_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("public_invite_email_idx").on(table.email),
    index("public_invite_status_idx").on(table.status),
    index("public_invite_expires_at_idx").on(table.expiresAt),
    index("public_invite_created_by_idx").on(table.createdBy),
    uniqueIndex("public_invite_token_hash_uidx").on(table.tokenHash),
  ]
);

export const publicInviteRelations = relations(publicInvite, ({ one }) => ({
  createdByUser: one(user, {
    fields: [publicInvite.createdBy],
    references: [user.id],
  }),
  acceptedUser: one(user, {
    fields: [publicInvite.acceptedUserId],
    references: [user.id],
  }),
}));
