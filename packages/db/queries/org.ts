import { and, asc, eq, inArray } from "drizzle-orm";
import type { Database } from "@/packages/db";
import {
  cohort,
  cohort_member,
  member,
  organization,
  user,
} from "@/packages/db/schema/auth";

export type OrgMemberRole =
  | "org_owner"
  | "org_admin"
  | "org_auditor"
  | "org_teacher"
  | "org_student";

export async function getOrgMemberRole(
  db: Database,
  params: { organizationId: string; userId: string }
): Promise<OrgMemberRole | null> {
  const [row] = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, params.organizationId),
        eq(member.userId, params.userId)
      )
    )
    .limit(1);
  return row?.role ?? null;
}

export async function listOrgMembers(
  db: Database,
  params: { organizationId: string }
) {
  const rows = await db
    .select({
      id: member.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: member.role,
      createdAt: member.createdAt,
    })
    .from(member)
    .innerJoin(user, eq(user.id, member.userId))
    .where(eq(member.organizationId, params.organizationId))
    .orderBy(asc(member.createdAt));
  return rows;
}

export async function listOrgCohorts(
  db: Database,
  params: {
    organizationId: string;
    userId?: string;
    memberRole?: OrgMemberRole | null;
  }
) {
  const { organizationId, userId, memberRole } = params;

  const canSeeAllCohorts =
    memberRole === "org_owner" ||
    memberRole === "org_admin" ||
    memberRole === "org_auditor";

  if (canSeeAllCohorts || !userId) {
    const rows = await db
      .select({
        id: cohort.id,
        name: cohort.name,
        image: cohort.image,
        organizationId: cohort.organizationId,
        createdAt: cohort.createdAt,
      })
      .from(cohort)
      .where(eq(cohort.organizationId, organizationId))
      .orderBy(asc(cohort.name));
    return rows;
  }

  const cohortIds = await db
    .select({ teamId: cohort_member.teamId })
    .from(cohort_member)
    .where(eq(cohort_member.userId, userId));
  const ids = cohortIds.map((r) => r.teamId);
  if (ids.length === 0) {
    return [];
  }

  const rows = await db
    .select({
      id: cohort.id,
      name: cohort.name,
      image: cohort.image,
      organizationId: cohort.organizationId,
      createdAt: cohort.createdAt,
    })
    .from(cohort)
    .where(
      and(eq(cohort.organizationId, organizationId), inArray(cohort.id, ids))
    )
    .orderBy(asc(cohort.name));
  return rows;
}

export async function listCohortMembers(
  db: Database,
  params: { cohortId: string }
) {
  const rows = await db
    .select({
      id: cohort_member.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: cohort_member.createdAt,
    })
    .from(cohort_member)
    .innerJoin(user, eq(user.id, cohort_member.userId))
    .where(eq(cohort_member.teamId, params.cohortId))
    .orderBy(asc(cohort_member.createdAt));
  return rows;
}

export async function getOrganization(
  db: Database,
  params: { organizationId: string }
) {
  const [row] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, params.organizationId))
    .limit(1);
  return row ?? null;
}
