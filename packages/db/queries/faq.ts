import { db } from "@/packages/db";
import { faq } from "@/packages/db/schema/faq";

export async function getAllFaqs() {
  return db.select().from(faq);
}
