"use client";

import posthog from "posthog-js";
import type { AnalyticsEventName } from "@/packages/analytics/events";

type EventProperties = Record<string, unknown>;

const isProd = process.env.NODE_ENV === "production";

export const track = (
  options: { event: AnalyticsEventName } & EventProperties
) => {
  if (!isProd) {
    console.log("Track", options);
    return;
  }

  const { event, ...properties } = options;
  posthog.capture(event, properties);
};

export const identify = (distinctId: string, properties?: EventProperties) => {
  if (!isProd) {
    console.log("Identify", { distinctId, properties });
    return;
  }

  posthog.identify(distinctId, properties);
};

export const captureException = (
  error: unknown,
  properties?: EventProperties
) => {
  if (!isProd) {
    console.log("CaptureException", { error, properties });
    return;
  }

  posthog.captureException(error, properties);
};

export const reset = () => {
  if (!isProd) {
    console.log("Reset");
    return;
  }

  posthog.reset();
};
