import type {
  AnyTask,
  TaskIdentifier,
  TaskPayload,
  TriggerOptions,
} from "@trigger.dev/sdk";
import { tasks } from "@trigger.dev/sdk";

interface TriggerJobConfig<TTask extends AnyTask> {
  task: TTask;
  payload: TaskPayload<TTask>;
  options?: TriggerOptions;
  retry?: {
    maxAttempts?: number;
    minDelayMs?: number;
    maxDelayMs?: number;
    factor?: number;
    randomize?: boolean;
  };
}

const DEFAULT_RETRY = {
  maxAttempts: 3,
  minDelayMs: 500,
  maxDelayMs: 30_000,
  factor: 2,
  randomize: true,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const maybeStatus = (error as { status?: number; statusCode?: number })
    .status;
  if (typeof maybeStatus === "number") {
    return maybeStatus;
  }

  const maybeStatusCode = (error as { statusCode?: number }).statusCode;
  if (typeof maybeStatusCode === "number") {
    return maybeStatusCode;
  }

  return undefined;
}

function isRetryable(error: unknown): boolean {
  const statusCode = getStatusCode(error);
  if (statusCode === 429) {
    return true;
  }
  if (typeof statusCode === "number" && statusCode >= 500) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  const code = (error as { code?: string }).code;
  if (code === "ECONNRESET") {
    return true;
  }
  if (code === "ETIMEDOUT") {
    return true;
  }
  if (code === "ENOTFOUND") {
    return true;
  }

  return false;
}

function getRetryAfterMs(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const retryAfterMs = (error as { retryAfterMs?: number }).retryAfterMs;
  if (typeof retryAfterMs === "number" && retryAfterMs >= 0) {
    return retryAfterMs;
  }

  return undefined;
}

function backoffDelay(
  attempt: number,
  {
    minDelayMs,
    maxDelayMs,
    factor,
    randomize,
  }: Required<NonNullable<TriggerJobConfig<AnyTask>["retry"]>>
): number {
  const raw = Math.min(
    maxDelayMs,
    Math.round(minDelayMs * factor ** (attempt - 1))
  );

  if (!randomize) {
    return raw;
  }

  const jitter = Math.round(raw * 0.2);
  const delta = Math.floor(Math.random() * (jitter * 2 + 1)) - jitter;
  return Math.max(0, raw + delta);
}

export async function triggerJob<TTask extends AnyTask>({
  task,
  payload,
  options,
  retry,
}: TriggerJobConfig<TTask>) {
  const retryConfig = {
    ...DEFAULT_RETRY,
    ...retry,
  };

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await tasks.trigger<TTask>(
        task.id as TaskIdentifier<TTask>,
        payload,
        options
      );
    } catch (error) {
      const shouldRetry =
        attempt < retryConfig.maxAttempts && isRetryable(error);
      if (!shouldRetry) {
        throw error;
      }

      const waitMs =
        getRetryAfterMs(error) ?? backoffDelay(attempt, retryConfig);
      await sleep(waitMs);
    }
  }

  throw new Error("Failed to trigger task");
}
