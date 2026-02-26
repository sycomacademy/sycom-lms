import { PostHog } from "posthog-node";
import type { AnalyticsEventName } from "@/packages/analytics/events";
import { env } from "@/packages/env/server";
import { createLoggerWithContext } from "@/packages/utils/logger";

type ServerEventProperties = Record<string, unknown>;

const analyticsLogger = createLoggerWithContext("analytics:server");

function getServerClient() {
  const posthogKey = env.POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = env.POSTHOG_HOST ?? process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!(posthogKey && posthogHost)) {
    return null;
  }

  return new PostHog(posthogKey, {
    host: posthogHost,
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function trackServerEvent(options: {
  event: AnalyticsEventName;
  distinctId?: string;
  properties?: ServerEventProperties;
}) {
  const client = getServerClient();

  if (!client) {
    analyticsLogger.debug("posthog server client not configured", {
      event: options.event,
    });
    return;
  }

  try {
    client.capture({
      distinctId: options.distinctId ?? "server",
      event: options.event,
      properties: options.properties,
    });
  } catch (error) {
    analyticsLogger.error("failed to capture posthog server event", {
      event: options.event,
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    await client.shutdown().catch(() => {
      analyticsLogger.warn("failed to shutdown posthog client");
    });
  }
}
