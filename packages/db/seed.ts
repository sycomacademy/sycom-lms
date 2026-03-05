import { ensurePublicOrg, seedCategories } from "./queries";

async function main() {
  console.log("Seeding database...");
  await ensurePublicOrg();
  await seedCategories();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
