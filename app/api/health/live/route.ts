import type { NextRequest } from "next/server";
import {
  forbiddenHealthResponse,
  isHealthRequestAllowed,
} from "@/packages/health/allowlist";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isHealthRequestAllowed(request)) {
    return forbiddenHealthResponse();
  }

  return Response.json(
    {
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString(),
      uptimeSec: Math.floor(process.uptime()),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
