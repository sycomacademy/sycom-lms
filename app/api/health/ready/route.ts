import type { NextRequest } from "next/server";
import {
  forbiddenHealthResponse,
  isHealthRequestAllowed,
} from "@/packages/health/allowlist";
import { healthDependencies } from "@/packages/health/probes";
import {
  buildReadinessResponse,
  checkDependencies,
} from "@/packages/health/runner";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isHealthRequestAllowed(request)) {
    return forbiddenHealthResponse();
  }

  const results = await checkDependencies(healthDependencies(), 1);
  const body = buildReadinessResponse(results);

  return Response.json(body, {
    status: body.status === "ok" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
