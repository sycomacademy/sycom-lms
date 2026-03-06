import { and, asc, eq, inArray, sql } from "drizzle-orm";
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

  if (rows.length === 0) {
    return [];
  }

  const userIds = rows.map((row) => row.userId);
  const cohortRows = await db
    .select({
      userId: cohort_member.userId,
      cohortId: cohort.id,
      cohortName: cohort.name,
    })
    .from(cohort_member)
    .innerJoin(cohort, eq(cohort.id, cohort_member.teamId))
    .where(
      and(
        inArray(cohort_member.userId, userIds),
        eq(cohort.organizationId, params.organizationId)
      )
    )
    .orderBy(asc(cohort.name));

  const cohortsByUser = new Map<string, { id: string; name: string }[]>();
  for (const cohortRow of cohortRows) {
    const existing = cohortsByUser.get(cohortRow.userId) ?? [];
    existing.push({ id: cohortRow.cohortId, name: cohortRow.cohortName });
    cohortsByUser.set(cohortRow.userId, existing);
  }

  return rows.map((row) => ({
    ...row,
    cohorts: cohortsByUser.get(row.userId) ?? [],
  }));
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
        memberCount:
          sql<number>`(SELECT count(*)::int FROM "auth"."cohort_member" cm WHERE cm."team_id" = ${cohort.id})`.as(
            "member_count"
          ),
        courseCount:
          sql<number>`(SELECT count(*)::int FROM "cohort_course" cc WHERE cc."cohort_id" = ${cohort.id})`.as(
            "course_count"
          ),
      })
      .from(cohort)
      .where(eq(cohort.organizationId, organizationId))
      .orderBy(asc(cohort.name));
    return rows;
  }

  const rows = await db
    .select({
      id: cohort.id,
      name: cohort.name,
      image: cohort.image,
      organizationId: cohort.organizationId,
      createdAt: cohort.createdAt,
      memberCount:
        sql<number>`(SELECT count(*)::int FROM "auth"."cohort_member" cm WHERE cm."team_id" = ${cohort.id})`.as(
          "member_count"
        ),
      courseCount:
        sql<number>`(SELECT count(*)::int FROM "cohort_course" cc WHERE cc."cohort_id" = ${cohort.id})`.as(
          "course_count"
        ),
    })
    .from(cohort)
    .innerJoin(
      cohort_member,
      and(eq(cohort_member.teamId, cohort.id), eq(cohort_member.userId, userId))
    )
    .where(eq(cohort.organizationId, organizationId))
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
      memberId: member.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: cohort_member.createdAt,
    })
    .from(cohort_member)
    .innerJoin(user, eq(user.id, cohort_member.userId))
    .innerJoin(cohort, eq(cohort.id, cohort_member.teamId))
    .innerJoin(
      member,
      and(
        eq(member.userId, cohort_member.userId),
        eq(member.organizationId, cohort.organizationId)
      )
    )
    .where(eq(cohort_member.teamId, params.cohortId))
    .orderBy(asc(cohort_member.createdAt));
  return rows;
}

export async function getOrganization(
  db: Database,
  params: { organizationId: string }
) {
  const [row] = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      createdAt: organization.createdAt,
      metadata: organization.metadata,
    })
    .from(organization)
    .where(eq(organization.id, params.organizationId))
    .limit(1);
  return row ?? null;
}
