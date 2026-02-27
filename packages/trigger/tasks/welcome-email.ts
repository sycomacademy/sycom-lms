import { schemaTask, wait } from "@trigger.dev/sdk";
import { render } from "@/packages/email/render";
import { sendEmail } from "@/packages/email/resend";
import { WelcomeEmail } from "@/packages/email/templates/welcome-email";
import { WelcomeEmailPayload } from "../schema";

export const welcomeEmailTask = schemaTask({
  id: "welcome-email",
  schema: WelcomeEmailPayload,
  run: async (payload) => {
    await wait.for({ minutes: 1 });

    const html = await render(WelcomeEmail({ name: payload.name }));

    await sendEmail({
      to: payload.email,
      subject: "Welcome to Sycom LMS 🎉",
      html,
    });

    return { sent: true, userId: payload.userId };
  },
});
