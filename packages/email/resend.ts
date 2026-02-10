import { Resend } from "resend";
import { env } from "@/packages/env/server";

export const resend = new Resend(env.RESEND_API_KEY);

const DEFAULT_FROM = env.EMAIL_FROM;

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
  return resend.emails.send({ from, to, subject, html });
}
