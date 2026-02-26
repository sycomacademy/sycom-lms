import type { Dependency, DependencyResult } from "./registry";

const resultCache = new Map<
  string,
  { result: DependencyResult; expiresAt: number }
>();

async function runProbe(dep: Dependency): Promise<DependencyResult> {
  const start = performance.now();
  const timeoutMessage = `Probe timed out after ${dep.timeoutMs}ms`;

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const result = await Promise.race([
      dep.probe(),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(timeoutMessage)),
          dep.timeoutMs
        );
      }),
    ]);

    return {
      name: dep.name,
      tier: dep.tier,
      healthy: result,
      latencyMs: Math.round(performance.now() - start),
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: dep.name,
      tier: dep.tier,
      healthy: false,
      latencyMs: Math.round(performance.now() - start),
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function checkDependency(dep: Dependency): Promise<DependencyResult> {
  const cached = resultCache.get(dep.name);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.result;
  }

  const result = await runProbe(dep);

  resultCache.set(dep.name, {
    result,
    expiresAt: Date.now() + dep.cacheTtlMs,
  });

  return result;
}

export async function checkDependencies(
  deps: Dependency[],
  maxTier?: number
): Promise<DependencyResult[]> {
  const filtered = maxTier ? deps.filter((dep) => dep.tier <= maxTier) : deps;
  return Promise.all(filtered.map((dep) => checkDependency(dep)));
}

export function buildReadinessResponse(results: DependencyResult[]) {
  const healthy = results
    .filter((result) => result.tier === 1)
    .every((result) => result.healthy);

  return {
    status: healthy ? ("ok" as const) : ("unhealthy" as const),
    checks: Object.fromEntries(
      results.map((result) => [
        result.name,
        {
          status: result.healthy ? "ok" : "error",
          latencyMs: result.latencyMs,
          ...(result.error && { error: result.error }),
        },
      ])
    ),
  };
}

export function buildDependenciesResponse(results: DependencyResult[]) {
  const tier1Healthy = results
    .filter((result) => result.tier === 1)
    .every((result) => result.healthy);
  const degraded = results.some((result) => result.tier > 1 && !result.healthy);

  let status: "ok" | "degraded" | "unhealthy" = "ok";

  if (!tier1Healthy) {
    status = "unhealthy";
  } else if (degraded) {
    status = "degraded";
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    dependencies: results.map((result) => ({
      name: result.name,
      tier: result.tier,
      healthy: result.healthy,
      latencyMs: result.latencyMs,
      lastChecked: result.lastChecked,
      ...(result.error && { error: result.error }),
    })),
  };
}

export function clearCache() {
  resultCache.clear();
}
