import { Resend } from "resend";
import { env } from "@/packages/env/server";
import { createLoggerWithContext } from "../utils/logger";

export const resend = new Resend(env.RESEND_API_KEY);

const DEFAULT_FROM = env.EMAIL_FROM;
const logger = createLoggerWithContext("email:send");

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
  const { error, data } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    logger.error("Error sending email", { error });
    throw new Error(error.message);
  }
  logger.info("Email sent", { data });
  return data;
}
