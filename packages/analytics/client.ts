"use client";

import posthog from "posthog-js";
import type { AnalyticsEventName } from "@/packages/analytics/events";
import { createLoggerWithContext } from "@/packages/utils/logger";

type EventProperties = Record<string, unknown>;

const isProd = process.env.NODE_ENV === "production";
const analyticsLogger = createLoggerWithContext("analytics:client");

export const track = (
  options: { event: AnalyticsEventName } & EventProperties
) => {
  if (!isProd) {
    analyticsLogger.debug("posthog client event", {
      event: options.event,
      properties: options.properties,
    });
    return;
  }

  const { event, ...properties } = options;
  posthog.capture(event, properties);
};

export const identify = (distinctId: string, properties?: EventProperties) => {
  if (!isProd) {
    analyticsLogger.debug("posthog client identify", {
      distinctId,
      properties,
    });
    return;
  }

  posthog.identify(distinctId, properties);
};

export const captureException = (
  error: unknown,
  properties?: EventProperties
) => {
  if (!isProd) {
    analyticsLogger.debug("posthog client captureException", {
      error,
      properties,
    });
    return;
  }

  posthog.captureException(error, properties);
};

export const reset = () => {
  if (!isProd) {
    analyticsLogger.debug("posthog client reset");
    return;
  }

  posthog.reset();
};
