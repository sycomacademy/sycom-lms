import { auth } from "@trigger.dev/sdk";

/**
 * Create a short-lived public access token scoped to a specific run.
 * Call this in a Server Component or Server Action, then pass the token
 * down to a Client Component that uses `useRealtimeRun`.
 *
 * @example
 * // Server Component
 * const token = await createRunAccessToken(handle.id);
 * return <ProgressTracker runId={handle.id} accessToken={token} />;
 */
export async function createRunAccessToken(
  runId: string,
  expirationTime = "1h"
): Promise<string> {
  return auth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime,
  });
}

/**
 * Create a single-use trigger token for a specific task.
 * Use this when you want a Client Component to trigger a task directly
 * without exposing your secret API key.
 *
 * @example
 * // Server Component
 * const token = await createTaskTriggerToken("welcome-email");
 * return <TriggerButton accessToken={token} />;
 */
export async function createTaskTriggerToken(
  taskId: string,
  expirationTime = "30m"
): Promise<string> {
  return auth.createTriggerPublicToken(taskId, { expirationTime });
}
