import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { auth } from "@/packages/auth/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-muted/30 p-4">
        {children}
      </main>
      <Footer />
    </>
  );
}
