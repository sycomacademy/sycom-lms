import { AuthRedirectGuard } from "@/components/auth/auth-redirect-guard";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <AuthRedirectGuard>
        <main className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-muted/30 p-4">
          {children}
        </main>
      </AuthRedirectGuard>
      <Footer />
    </>
  );
}
