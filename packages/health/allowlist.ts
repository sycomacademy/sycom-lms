import type { NextRequest } from "next/server";
import { env } from "@/packages/env/server";

function normalizeIp(ip: string): string {
  const trimmed = ip.trim();
  return trimmed.startsWith("::ffff:") ? trimmed.slice(7) : trimmed;
}

function getClientIp(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0];
    if (firstIp) {
      return normalizeIp(firstIp);
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return normalizeIp(realIp);
  }

  return null;
}

function parseAllowlist(): Set<string> | null {
  if (!env.HEALTH_IP_ALLOWLIST) {
    return null;
  }

  return new Set(
    env.HEALTH_IP_ALLOWLIST.split(",")
      .map((value) => normalizeIp(value))
      .filter(Boolean)
  );
}

export function isHealthRequestAllowed(request: NextRequest): boolean {
  const allowlist = parseAllowlist();

  if (!allowlist || allowlist.size === 0 || allowlist.has("*")) {
    return true;
  }

  const clientIp = getClientIp(request);
  if (!clientIp) {
    return false;
  }

  return allowlist.has(clientIp);
}

export function forbiddenHealthResponse() {
  return Response.json(
    {
      status: "forbidden",
    },
    {
      status: 403,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
