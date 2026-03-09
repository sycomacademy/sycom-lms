import { Resend } from "resend";
import { env } from "@/packages/env/server";
import { createLoggerWithContext } from "../utils/logger";

export const resend = new Resend(env.RESEND_API_KEY);

const DEFAULT_FROM = env.RESEND_EMAIL_FROM;
const DEFAULT_REPLY_TO = env.RESEND_EMAIL_REPLY_TO;
const emailLogger = createLoggerWithContext("email:send");

/**
 * Send an email via Resend.
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = DEFAULT_FROM,
  headers,
  replyTo = DEFAULT_REPLY_TO,
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  headers?: Record<string, string>;
  replyTo?: string | string[];
}) {
  const response = await resend.emails.send({
    from,
    to,
    subject,
    html,
    headers,
    replyTo,
  });
  if (response.error) {
    emailLogger.error("Error sending email", {
      subject,
      to,
      error: response.error,
    });
  }
  return response;
}
