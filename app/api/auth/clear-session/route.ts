import { type NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/packages/auth/helper";

/**
 * Clears the session cookie and redirects. Used when the session is invalid
 * (e.g. expired or revoked) so the proxy no longer sends the user to dashboard.
 * Cookie mutation is only allowed in Route Handlers, not in layout RSC.
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("redirect") ?? "/sign-in";
  const redirectTo = raw.startsWith("/") ? raw : "/sign-in";
  const url = new URL(redirectTo, request.url);
  const res = NextResponse.redirect(url);
  res.cookies.delete(AUTH_COOKIE);
  return res;
}
