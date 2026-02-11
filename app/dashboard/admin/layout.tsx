import { redirect } from "next/navigation";
import { getSession } from "@/packages/auth/helper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
