import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Optimistic cookie-based auth check.
 *
 * - No DB call — only checks whether the better-auth session cookie exists.
 * - Dashboard routes: redirect to /sign-in if cookie is missing.
 * - Auth routes: redirect to /dashboard if cookie is present.
 *
 * The dashboard layout guard (`getSession()` + redirect) remains the secure
 * fallback that actually validates the session against the database.
 */

const AUTH_COOKIE = "better-auth.session_token";

/** Routes that require authentication */
const PROTECTED_PREFIXES = ["/dashboard"];

/** Routes only for unauthenticated users */
const AUTH_ROUTES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(AUTH_COOKIE);

  // Protected routes: redirect to sign-in if no session cookie
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Auth routes: redirect to dashboard if already signed in
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
