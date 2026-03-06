import { orgGuard } from "@/packages/auth/helper";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await orgGuard();
  return <>{children}</>;
}
