import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// const PORT_SUFFIX_RE = /:\d+$/;

export function proxy(request: NextRequest) {
  // const hostname = request.headers.get("host") ?? "";
  // const rootDomain = process.env.ROOT_DOMAIN ?? "localhost:3000";

  // const subdomain = extractSubdomain(hostname, rootDomain);

  // // Subdomain detected — rewrite to /tenant/[slug]/...
  // if (subdomain && subdomain !== "www") {
  //   const { pathname } = request.nextUrl;

  //   // Don't rewrite API routes or Next.js internals
  //   if (
  //     pathname.startsWith("/api/") ||
  //     pathname.startsWith("/_next/") ||
  //     pathname.startsWith("/ingest/")
  //   ) {
  //     return NextResponse.next();
  //   }

  //   const url = request.nextUrl.clone();
  //   url.pathname = `/tenant/${subdomain}${pathname}`;
  //   return NextResponse.rewrite(url);
  // }

  // Main domain — existing auth guard for protected routes
  const session = getSessionCookie(request);

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    // Match all paths for subdomain detection (exclude static files)
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

// function extractSubdomain(hostname: string, rootDomain: string): string | null {
//   const rootWithoutPort = rootDomain.replace(PORT_SUFFIX_RE, "");
//   const hostnameWithoutPort = hostname.replace(PORT_SUFFIX_RE, "");

//   // Exact match = main domain, no subdomain
//   if (hostnameWithoutPort === rootWithoutPort) {
//     return null;
//   }

//   // Check if hostname ends with .rootDomain
//   const suffix = `.${rootWithoutPort}`;
//   if (hostnameWithoutPort.endsWith(suffix)) {
//     const sub = hostnameWithoutPort.slice(0, -suffix.length);
//     if (sub && !sub.includes(".")) {
//       return sub;
//     }
//   }

//   // Local dev: handle "slug.localhost"
//   if (
//     rootWithoutPort === "localhost" &&
//     hostnameWithoutPort.endsWith(".localhost")
//   ) {
//     return hostnameWithoutPort.replace(".localhost", "");
//   }

//   return null;
// }
