import { Resend } from "resend";
import { env } from "@/packages/env/server";
import { createLoggerWithContext } from "../utils/logger";

export const resend = new Resend(env.RESEND_API_KEY);

const DEFAULT_FROM = env.EMAIL_FROM;
const emailLogger = createLoggerWithContext("email:send");

/**
 * Send an email via Resend.
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = DEFAULT_FROM,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  const response = await resend.emails.send({ from, to, subject, html });
  if (response.error) {
    emailLogger.error("Error sending email", {
      subject,
      to,
      error: response.error,
    });
  }
  return response;
}
