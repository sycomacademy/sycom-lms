import sgMail from "@sendgrid/mail";
import { env } from "@/packages/env/server";

const apiKey = env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}
// sgMail.setDataResidency('eu');
const DEFAULT_FROM = env.SENDGRID_FROM ?? env.EMAIL_FROM;

/**
 * Send an email via SendGrid.
 * Requires SENDGRID_API_KEY and SENDGRID_FROM (or EMAIL_FROM) in env.
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
  if (!apiKey) {
    throw new Error(
      "SENDGRID_API_KEY is not set. Add it to .env.local to use SendGrid."
    );
  }
  return sgMail.send({ from, to, subject, html });
}
