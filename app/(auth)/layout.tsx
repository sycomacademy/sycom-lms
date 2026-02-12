import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthLeftPanel } from "@/components/auth/left-panel";
import { LoginTestimonials } from "@/components/auth/testimonials";
import { getSession } from "@/packages/auth/helper";
import { createLoggerWithContext } from "@/packages/utils/logger";

const layoutLogger = createLoggerWithContext("auth:layout");

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  layoutLogger.debug("requesting session");
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className="flex min-h-svh bg-background p-1">
      <div className="relative hidden overflow-hidden bg-foreground lg:flex lg:w-1/2">
        {/* Particles background (client component) */}
        <AuthLeftPanel />

        {/* Logo top-left */}
        <Link
          className="absolute top-6 left-6 z-20 flex items-center gap-2 transition-opacity hover:opacity-80"
          href="/"
        >
          <div className="flex size-7 items-center justify-center rounded-md bg-white/10">
            <Image
              alt="Sycom Solutions logo"
              height={32}
              src="/sycom-logo.png"
              width={32}
            />
          </div>
        </Link>

        {/* Testimonials centered */}
        <div className="relative z-10 flex h-full w-full items-center justify-center p-8">
          <div className="max-w-lg">
            <LoginTestimonials />
          </div>
        </div>

        {/* Top fade */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32"
          style={{
            background:
              "linear-gradient(to bottom, var(--foreground), transparent)",
          }}
        />

        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32"
          style={{
            background:
              "linear-gradient(to top, var(--foreground), transparent)",
          }}
        />
      </div>

      {/* Right panel — auth form */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 lg:p-12">
        <div className="flex h-full w-full max-w-md flex-col">
          <div className="mb-8 flex items-center lg:hidden">
            <Link className="flex items-center gap-2" href="/">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary">
                <Image
                  alt="Sycom Solutions logo"
                  height={32}
                  src="/sycom-logo.png"
                  width={32}
                />
              </div>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
