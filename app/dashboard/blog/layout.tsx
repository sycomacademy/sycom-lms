import { instructorGuard } from "@/packages/auth/helper";

export default async function DashboardBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await instructorGuard();
  return <div className="mb-10 md:ml-12">{children}</div>;
}
