import { checkHealth as checkDbHealth } from "@/packages/db/queries";
import { env } from "@/packages/env/server";
import type { Dependency } from "./registry";

export function apiProbe(): Dependency {
  return {
    name: "api",
    tier: 1,
    cacheTtlMs: 5000,
    timeoutMs: 1000,
    probe: async () => true,
  };
}

export function databaseProbe(): Dependency {
  return {
    name: "database",
    tier: 1,
    cacheTtlMs: 30_000,
    timeoutMs: 3000,
    probe: async () => {
      await checkDbHealth();
      return true;
    },
  };
}

export function resendProbe(): Dependency {
  return {
    name: "resend",
    tier: 2,
    cacheTtlMs: 60_000,
    timeoutMs: 5000,
    probe: async () => {
      const response = await fetch("https://api.resend.com/domains", {
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      return response.ok;
    },
  };
}

export function healthDependencies(): Dependency[] {
  return [apiProbe(), databaseProbe(), resendProbe()];
}
