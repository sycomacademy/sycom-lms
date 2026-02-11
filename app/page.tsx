import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="font-semibold text-2xl tracking-tight">Sycom LMS</h1>
        <p className="text-muted-foreground text-sm">
          Learn cybersecurity with hands-on labs and certification prep.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button nativeButton={false} render={<Link href="/sign-in" />}>
          Sign in
        </Button>
        <Button
          nativeButton={false}
          render={<Link href="/dashboard" />}
          variant="outline"
        >
          Dashboard
        </Button>
      </div>
    </main>
  );
}
