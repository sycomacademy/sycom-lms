import { and, eq } from "drizzle-orm";
import { db } from "@/packages/db";
import { cohort, organization } from "@/packages/db/schema/auth";

const PUBLIC_ORG_SLUG = "platform";
const PUBLIC_ORG_NAME = "Platform";
const PUBLIC_COHORT_NAME = "General";

async function ensurePublicOrg() {
  const [existing] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, PUBLIC_ORG_SLUG))
    .limit(1);

  let orgId: string;

  if (existing) {
    orgId = existing.id;
    console.log(`Public org already exists (id: ${orgId})`);
  } else {
    orgId = crypto.randomUUID();
    await db.insert(organization).values({
      id: orgId,
      name: PUBLIC_ORG_NAME,
      slug: PUBLIC_ORG_SLUG,
    });
    console.log(`Created public org "${PUBLIC_ORG_NAME}" (id: ${orgId})`);
  }

  const [existingCohort] = await db
    .select({ id: cohort.id })
    .from(cohort)
    .where(
      and(eq(cohort.organizationId, orgId), eq(cohort.name, PUBLIC_COHORT_NAME))
    )
    .limit(1);

  if (existingCohort) {
    console.log(`Public cohort already exists (id: ${existingCohort.id})`);
  } else {
    const cohortId = crypto.randomUUID();
    await db.insert(cohort).values({
      id: cohortId,
      name: PUBLIC_COHORT_NAME,
      organizationId: orgId,
    });
    console.log(
      `Created public cohort "${PUBLIC_COHORT_NAME}" (id: ${cohortId})`
    );
  }
}

async function main() {
  console.log("Seeding database...");
  await ensurePublicOrg();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
