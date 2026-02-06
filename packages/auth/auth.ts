import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db, schema } from "@/packages/db";
import { env } from "@/packages/env/server";

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Check if SendGrid is properly configured
  if (
    !env.SENDGRID_API_KEY ||
    env.SENDGRID_API_KEY === "your_sendgrid_api_key"
  ) {
    console.error(
      "[Auth] SendGrid not configured. Please set SENDGRID_API_KEY environment variable."
    );
    throw new Error(
      "Email service is not configured. Please contact support or try again later."
    );
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: env.SENDGRID_FROM_EMAIL, name: "Sycom LMS" },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Auth] SendGrid error:", response.status, errorText);
      throw new Error(
        "Failed to send email. Please try again later or contact support."
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Failed to send")) {
      throw error;
    }
    console.error("[Auth] Email sending error:", error);
    throw new Error(
      "Failed to send email. Please try again later or contact support."
    );
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password - Sycom LMS",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>Hi ${user.name},</p>
            <p>You requested to reset your password. Click the button below to set a new password:</p>
            <p style="margin: 24px 0;">
              <a href="${url}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
            <p style="color: #666; font-size: 14px;">- The Sycom LMS Team</p>
          </div>
        `,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email - Sycom LMS",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Sycom LMS!</h2>
            <p>Hi ${user.name},</p>
            <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
            <p style="margin: 24px 0;">
              <a href="${url}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email
              </a>
            </p>
            <p>If you didn't create an account with us, you can safely ignore this email.</p>
            <p style="color: #666; font-size: 14px;">- The Sycom LMS Team</p>
          </div>
        `,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    linkedin: {
      clientId: env.LINKEDIN_CLIENT_ID,
      clientSecret: env.LINKEDIN_CLIENT_SECRET,
    },
  },
  plugins: [nextCookies()],
});
