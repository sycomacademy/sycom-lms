import { defineConfig } from "@trigger.dev/sdk";
import { env } from "./packages/env/server";

export default defineConfig({
  project: env.TRIGGER_PROJECT_REF,
  runtime: "bun",
  dirs: ["./packages/trigger/tasks", "./packages/trigger/init"],
  maxDuration: 3600,
});
