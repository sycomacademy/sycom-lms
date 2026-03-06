import { redirect } from "next/navigation";
import { orgGuardWithSlug } from "@/packages/auth/helper";

export default async function OrgIndexPage() {
  const { slug } = await orgGuardWithSlug();
  redirect(`/dashboard/org/${slug}`);
}
