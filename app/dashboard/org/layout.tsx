import { orgGuard } from "@/packages/auth/helper";

export default async function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await orgGuard();
  return <>{children}</>;
}
