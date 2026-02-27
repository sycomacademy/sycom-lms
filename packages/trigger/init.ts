import { logger, tasks } from "@trigger.dev/sdk";

tasks.onStartAttempt(({ ctx, payload, task }) => {
  logger.info("Run started", { ctx, payload, task });
});

tasks.onSuccess(({ ctx, payload, task }) => {
  logger.info("Run succeeded", { ctx, payload, task });
});

tasks.onFailure(({ ctx, payload, task }) => {
  logger.error("Run failed", { ctx, payload, task });
});
