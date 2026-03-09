import { syncVercelEnvVars } from "@trigger.dev/build/extensions/core";
import { defineConfig } from "@trigger.dev/sdk";
import { env } from "./packages/env/server";

export default defineConfig({
  project: env.TRIGGER_PROJECT_REF,
  runtime: "bun",
  dirs: ["./packages/trigger/tasks", "./packages/trigger/init"],
  maxDuration: 3600,
  build: {
    // Add the syncVercelEnvVars build extension
    extensions: [
      syncVercelEnvVars({
        // A personal access token created in your Vercel account settings
        // Used to authenticate API requests to Vercel
        // Generate at: https://vercel.com/account/tokens
        vercelAccessToken: process.env.VERCEL_ACCESS_TOKEN,
        // The unique identifier of your Vercel project
        // Found in Project Settings > General > Project ID
        projectId: process.env.VERCEL_PROJECT_ID,
        // Optional: The ID of your Vercel team
        // Only required for team projects
        // Found in Team Settings > General > Team ID
        vercelTeamId: process.env.VERCEL_TEAM_ID,
      }),
    ],
  },
});
