import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/packages/auth/helper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link
            className="font-medium text-foreground text-sm transition-colors hover:text-muted-foreground"
            href="/"
          >
            Sycom LMS
          </Link>
          <Link
            className="text-muted-foreground text-sm transition-colors hover:text-foreground"
            href="/"
          >
            Home
          </Link>
        </nav>
      </header>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
