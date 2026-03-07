import { logger, schemaTask, wait } from "@trigger.dev/sdk";
import { render } from "@/packages/email/render";
import { sendEmail } from "@/packages/email/resend";
import { WelcomeEmail } from "@/packages/email/templates/welcome-email";
import { WelcomeEmailPayload } from "../schema";

export const welcomeEmailTask = schemaTask({
  id: "welcome-email",
  schema: WelcomeEmailPayload,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1_800_000,
    maxTimeoutInMs: 7_200_000,
    factor: 4,
    randomize: false,
  },
  run: async (payload) => {
    await wait.for({ minutes: 1 });

    const html = await render(WelcomeEmail({ name: payload.name }));

    const { error, data } = await sendEmail({
      to: payload.email,
      subject: "Welcome to Sycom LMS 🎉",
      from: "Abdul <abdul@learn.sycomsolutions.com>",
      replyTo: "a.shehu@sycomsolutions.com",
      html,
    });
    if (error) {
      logger.error("Failed to send email", { error });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    logger.info("Email sent successfully", { emailId: data?.id });

    return { sent: true, userId: payload.userId };
  },
});
