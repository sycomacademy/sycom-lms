import { db } from "@/packages/db";
import { feature } from "@/packages/db/schema/feature";

export async function getAllFeatures() {
  return db.select().from(feature);
}
