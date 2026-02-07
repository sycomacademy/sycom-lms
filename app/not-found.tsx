import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <div className="space-y-2">
          <h1 className="font-sans font-semibold text-6xl text-foreground tracking-tight">
            404
          </h1>
          <h2 className="font-medium font-sans text-foreground text-xl">
            Page not found
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground text-sm">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Check the URL or head back to explore our courses.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/" />}
            variant="outline"
          >
            Go Home
          </Button>
          <Button nativeButton={false} render={<Link href="/courses" />}>
            Browse Courses
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
