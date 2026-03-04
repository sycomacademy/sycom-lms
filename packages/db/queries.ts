import { and, eq, sql } from "drizzle-orm";
import type { Database } from "@/packages/db";
import { db } from "@/packages/db";
import { createLoggerWithContext } from "@/packages/utils/logger";
import { schema } from "./schema";

const logger = createLoggerWithContext("db:queries");
const { cohort, organization } = schema;
const PUBLIC_ORG_SLUG = "platform";
const PUBLIC_ORG_NAME = "Platform";
const PUBLIC_COHORT_NAME = "General";

export async function checkHealth(database: Database = db) {
  await database.execute(sql`SELECT 1`);
  return true;
}

export async function ensurePublicOrg(database: Database = db) {
  const [existing] = await database
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, PUBLIC_ORG_SLUG))
    .limit(1);

  let orgId: string;

  if (existing) {
    orgId = existing.id;
    logger.info(`Public org already exists (id: ${orgId})`);
  } else {
    orgId = crypto.randomUUID();
    await database.insert(organization).values({
      id: orgId,
      name: PUBLIC_ORG_NAME,
      slug: PUBLIC_ORG_SLUG,
    });
    logger.info(`Created public org "${PUBLIC_ORG_NAME}" (id: ${orgId})`);
  }

  const [existingCohort] = await database
    .select({ id: cohort.id })
    .from(cohort)
    .where(
      and(eq(cohort.organizationId, orgId), eq(cohort.name, PUBLIC_COHORT_NAME))
    )
    .limit(1);

  if (existingCohort) {
    logger.info(`Public cohort already exists (id: ${existingCohort.id})`);
  } else {
    const cohortId = crypto.randomUUID();
    await database.insert(cohort).values({
      id: cohortId,
      name: PUBLIC_COHORT_NAME,
      organizationId: orgId,
    });
    logger.info(
      `Created public cohort "${PUBLIC_COHORT_NAME}" (id: ${cohortId})`
    );
  }
}
