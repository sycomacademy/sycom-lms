import { PostHog } from "posthog-node";
import type { AnalyticsEventName } from "@/packages/analytics/events";
import { env } from "@/packages/env/client";
import { createLoggerWithContext } from "@/packages/utils/logger";

type ServerEventProperties = Record<string, unknown>;

const analyticsLogger = createLoggerWithContext("analytics:server");
const isProd = process.env.NODE_ENV === "production";

function getServerClient() {
  const posthogKey = env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = env.NEXT_PUBLIC_POSTHOG_HOST;

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
  if (!isProd) {
    analyticsLogger.debug("posthog server event", {
      event: options.event,
      properties: options.properties,
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
