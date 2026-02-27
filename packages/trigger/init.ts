import { tasks } from "@trigger.dev/sdk";
import { createLoggerWithContext } from "../utils/logger";

const logger = createLoggerWithContext("trigger:init");

tasks.onStartAttempt(({ ctx, payload, task }) => {
  logger.info("Run started", { ctx, payload, task });
});

tasks.onSuccess(({ ctx, payload, task }) => {
  logger.info("Run succeeded", { ctx, payload, task });
});

tasks.onFailure(({ ctx, payload, task }) => {
  logger.error("Run failed", { ctx, payload, task });
});
