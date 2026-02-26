import type { NextRequest } from "next/server";
import {
  forbiddenHealthResponse,
  isHealthRequestAllowed,
} from "@/packages/health/allowlist";
import { healthDependencies } from "@/packages/health/probes";
import {
  buildDependenciesResponse,
  checkDependencies,
} from "@/packages/health/runner";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isHealthRequestAllowed(request)) {
    return forbiddenHealthResponse();
  }

  const results = await checkDependencies(healthDependencies());
  const body = buildDependenciesResponse(results);

  return Response.json(body, {
    status: body.status === "unhealthy" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
