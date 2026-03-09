import { BackButton } from "@/components/layout/back-button";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/components/layout/foresight-link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <h2 className="font-semibold text-foreground text-lg">404</h2>
        <p className="max-w-md text-muted-foreground text-sm">Page not found</p>
        <div className="flex gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/" />}
            size="sm"
            variant="outline"
          >
            Home
          </Button>
          <BackButton size="sm" variant="outline">
            Back
          </BackButton>
        </div>
      </div>
      <Footer />
    </>
  );
}
