import { ensurePublicOrg } from "./queries";

async function main() {
  console.log("Seeding database...");
  await ensurePublicOrg();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
