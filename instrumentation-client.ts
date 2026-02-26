import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (typeof window !== "undefined" && posthogKey) {
  posthog.init(posthogKey, {
    api_host: "/ingest",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
    defaults: "2026-01-30",
  });
}
