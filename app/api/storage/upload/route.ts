import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/packages/auth/helper";
import { db } from "@/packages/db";
import { uploadSessions } from "@/packages/db/schema/files";
import { getWebsiteUrl } from "@/packages/env/utils";
import { createLoggerWithContext } from "@/packages/utils/logger";

const apiLogger = createLoggerWithContext("api:storage:upload");

/**
 * Handle Vercel Blob client uploads
 *
 * This route handles:
 * 1. Token generation for client uploads (POST with type: "blob.generate-client-token")
 * 2. Upload completion notification (POST with type: "blob.upload-completed")
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // Verify the user is authenticated
        const session = await getSession();
        if (!session?.user?.id) {
          throw new Error("Unauthorized");
        }

        // Parse the client payload to get session info
        if (!clientPayload) {
          throw new Error("Invalid upload request: missing payload");
        }

        const payload = JSON.parse(clientPayload) as {
          sessionId?: string;
          clientToken?: string;
        };
        if (!payload.sessionId) {
          throw new Error("Invalid upload request: missing sessionId");
        }
        if (!payload.clientToken) {
          throw new Error("Invalid upload request: missing clientToken");
        }

        // Verify the upload session exists and belongs to this user
        const uploadSession = await db.query.uploadSessions.findFirst({
          where: and(
            eq(uploadSessions.id, payload.sessionId),
            eq(uploadSessions.userId, session.user.id),
            eq(uploadSessions.clientToken, payload.clientToken),
            eq(uploadSessions.status, "pending")
          ),
        });

        if (!uploadSession) {
          throw new Error("Invalid or expired upload session");
        }

        // Check if session expired
        if (new Date() > uploadSession.expiresAt) {
          await db
            .update(uploadSessions)
            .set({ status: "expired" })
            .where(eq(uploadSessions.id, uploadSession.id));
          throw new Error("Upload session expired");
        }

        // Update session status to uploading
        await db
          .update(uploadSessions)
          .set({ status: "uploading" })
          .where(eq(uploadSessions.id, uploadSession.id));

        return {
          allowedContentTypes: [uploadSession.contentType],
          maximumSizeInBytes: uploadSession.size + 1024, // Allow slight overhead
          // Use our pre-computed storage key as the pathname
          pathname: uploadSession.storageKey,
          tokenPayload: JSON.stringify({
            sessionId: uploadSession.id,
            userId: session.user.id,
          }),
          // Callback URL for onUploadCompleted
          callbackUrl: `${getWebsiteUrl()}/api/storage/upload`,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Parse token payload
        const payload = tokenPayload ? JSON.parse(tokenPayload) : null;
        if (!payload?.sessionId) {
          console.error("Missing session ID in token payload");
          return;
        }

        // Log completion (file record is created in confirmUpload)
        apiLogger.debug("Upload completed:", {
          sessionId: payload.sessionId,
          url: blob.url,
          pathname: blob.pathname,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    );
  }
}
