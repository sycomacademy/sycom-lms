import type { NextRequest } from "next/server";
import { analyticsEvents } from "@/packages/analytics/events";
import { trackServerEvent } from "@/packages/analytics/server";
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
    await trackServerEvent({
      event: analyticsEvents.healthCheckBlocked,
      distinctId: "health-check",
      properties: {
        path: "/api/health/dependencies",
      },
    });

    return forbiddenHealthResponse();
  }

  const results = await checkDependencies(healthDependencies());
  const body = buildDependenciesResponse(results);

  if (body.status !== "ok") {
    const failingDependencies = body.dependencies
      .filter((dependency) => !dependency.healthy)
      .map((dependency) => dependency.name);

    await trackServerEvent({
      event: analyticsEvents.healthDependenciesNotOk,
      distinctId: "health-check",
      properties: {
        path: "/api/health/dependencies",
        status: body.status,
        dependency_count: body.dependencies.length,
        failing_dependency_count: failingDependencies.length,
        failing_dependencies: failingDependencies,
      },
    });
  }

  return Response.json(body, {
    status: body.status === "unhealthy" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
