"use server";

import { getPostHogClient } from "@/lib/posthog-server";
import { getSession } from "@/packages/auth/helper";
import { db } from "@/packages/db";
import { report } from "@/packages/db/schema/report";

export interface ReportFormState {
  success: boolean;
  error?: string;
}

export async function submitReport(
  formData: FormData
): Promise<ReportFormState> {
  const session = await getSession();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to submit a report.",
    };
  }

  const type = formData.get("type") as string;
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string | null;
  const email = session.user.email;

  if (!email) {
    return {
      success: false,
      error: "Email is required.",
    };
  }

  if (!(type && subject && description)) {
    return {
      success: false,
      error: "All fields are required.",
    };
  }

  if (!["bug", "feature", "complaint", "other"].includes(type)) {
    return {
      success: false,
      error: "Invalid report type.",
    };
  }

  const posthog = getPostHogClient();

  try {
    await db.insert(report).values({
      userId: session.user.id,
      email,
      type: type as "bug" | "feature" | "complaint" | "other",
      subject,
      description,
      imageUrl: imageUrl || null,
    });

    posthog.capture({
      distinctId: session.user.id,
      event: "report_submitted",
      properties: {
        report_type: type,
        has_screenshot: Boolean(imageUrl),
        $set: { email },
      },
    });
    await posthog.shutdown();

    return { success: true };
  } catch (error) {
    console.error("Failed to submit report:", error);
    posthog.capture({
      distinctId: session.user.id,
      event: "report_submission_failed",
      properties: {
        report_type: type,
        error_message: error instanceof Error ? error.message : "Unknown error",
      },
    });
    await posthog.shutdown();
    return {
      success: false,
      error: "Failed to submit report. Please try again.",
    };
  }
}
