import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "@/packages/db/helper";
import { organization, user } from "@/packages/db/schema/auth";
import { course } from "@/packages/db/schema/course";

// ---------------------------------------------------------------------------
// Org Course Entitlement (the "deal" — which courses an org can access)
// ---------------------------------------------------------------------------

export const orgCourseEntitlement = pgTable(
  "org_course_entitlement",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `oce_${crypto.randomUUID()}`),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    maxSeats: integer("max_seats"),
    isActive: boolean("is_active").default(true).notNull(),
    expiresAt: timestamp("expires_at"),
    grantedBy: text("granted_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt,
    updatedAt,
  },
  (table) => [
    unique("org_course_entitlement_org_course_uniq").on(
      table.organizationId,
      table.courseId
    ),
    index("org_course_entitlement_org_id_idx").on(table.organizationId),
    index("org_course_entitlement_course_id_idx").on(table.courseId),
  ]
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const orgCourseEntitlementRelations = relations(
  orgCourseEntitlement,
  ({ one }) => ({
    organization: one(organization, {
      fields: [orgCourseEntitlement.organizationId],
      references: [organization.id],
    }),
    course: one(course, {
      fields: [orgCourseEntitlement.courseId],
      references: [course.id],
    }),
    grantedByUser: one(user, {
      fields: [orgCourseEntitlement.grantedBy],
      references: [user.id],
    }),
  })
);
