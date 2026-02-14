"use client";

import { useMutation } from "@tanstack/react-query";
import { upload } from "@vercel/blob/client";
import { useCallback, useRef, useState } from "react";
import { toastManager } from "@/components/ui/toast";
import type { files } from "@/packages/db/schema/files";
import { useTRPC } from "@/packages/trpc/client";

export type FileRecord = typeof files.$inferSelect;

export type UploadStatus =
  | "idle"
  | "preparing"
  | "uploading"
  | "confirming"
  | "success"
  | "error";

export interface UploadState {
  status: UploadStatus;
  progress: number; // 0-100
  error?: string;
  file?: FileRecord;
}

export interface UseFileUploadOptions {
  /**
   * Entity type the file belongs to (e.g., 'profile', 'course', 'lesson')
   */
  entityType: string;
  /**
   * Entity ID the file belongs to
   */
  entityId: string;
  /**
   * File category (determines size limits and allowed types)
   */
  category: "video" | "document" | "image" | "avatar" | "attachment";
  /**
   * File visibility
   */
  visibility?: "public" | "private";
  /**
   * Callback when upload succeeds
   */
  onSuccess?: (file: FileRecord) => void;
  /**
   * Callback when upload fails
   */
  onError?: (error: Error) => void;
}

const INITIAL_STATE: UploadState = {
  status: "idle",
  progress: 0,
};

/**
 * Hook for uploading files with progress tracking and toast notifications
 *
 * Uses a two-phase upload:
 * 1. Request upload session from server (gets token)
 * 2. Upload directly to Vercel Blob with progress
 * 3. Confirm upload and save metadata
 */
export function useFileUpload(options: UseFileUploadOptions) {
  const { entityType, entityId, category, visibility = "public" } = options;

  const [state, setState] = useState<UploadState>(INITIAL_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);
  const toastIdRef = useRef<string | null>(null);

  const trpc = useTRPC();

  const requestUploadMutation = useMutation({
    ...trpc.file.requestUpload.mutationOptions(),
  });

  const confirmUploadMutation = useMutation({
    ...trpc.file.confirmUpload.mutationOptions(),
  });

  const uploadFile = useCallback(
    async (file: File): Promise<FileRecord | null> => {
      // Reset state
      abortControllerRef.current = new AbortController();
      setState({ status: "preparing", progress: 0 });

      // Show loading toast
      toastIdRef.current = toastManager.add({
        title: "Preparing upload...",
        type: "loading",
      });

      try {
        // Step 1: Request upload session
        const session = await requestUploadMutation.mutateAsync({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          entityType,
          entityId,
          category,
        });

        // Update toast
        if (toastIdRef.current) {
          toastManager.update(toastIdRef.current, {
            title: "Uploading...",
            description: "0%",
          });
        }

        setState({ status: "uploading", progress: 0 });

        // Step 2: Upload to Vercel Blob (pathname is overridden server-side with storageKey)
        const blob = await upload(session.storageKey, file, {
          access: "public",
          handleUploadUrl: "/api/storage/upload",
          clientPayload: JSON.stringify({
            sessionId: session.sessionId,
            clientToken: session.clientToken,
          }),
          onUploadProgress: (event) => {
            const progress = Math.round(event.percentage);
            setState((s) => ({ ...s, progress }));

            if (toastIdRef.current) {
              toastManager.update(toastIdRef.current, {
                description: `${progress}%`,
              });
            }
          },
          abortSignal: abortControllerRef.current.signal,
        });

        // Step 3: Confirm upload
        if (toastIdRef.current) {
          toastManager.update(toastIdRef.current, {
            title: "Finalizing...",
            description: undefined,
          });
        }

        setState((s) => ({ ...s, status: "confirming", progress: 100 }));

        const fileRecord = await confirmUploadMutation.mutateAsync({
          sessionId: session.sessionId,
          url: blob.url,
          visibility,
        });

        // Success
        setState({ status: "success", progress: 100, file: fileRecord });

        if (toastIdRef.current) {
          toastManager.update(toastIdRef.current, {
            title: "Upload complete",
            type: "success",
          });
          toastIdRef.current = null;
        }

        options.onSuccess?.(fileRecord);
        return fileRecord;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";

        setState({ status: "error", progress: 0, error: message });

        if (toastIdRef.current) {
          toastManager.update(toastIdRef.current, {
            title: "Upload failed",
            description: message,
            type: "error",
          });
          toastIdRef.current = null;
        }

        options.onError?.(error instanceof Error ? error : new Error(message));
        return null;
      }
    },
    [
      entityType,
      entityId,
      category,
      visibility,
      options,
      requestUploadMutation,
      confirmUploadMutation,
    ]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();

    if (toastIdRef.current) {
      toastManager.close(toastIdRef.current);
      toastIdRef.current = null;
    }

    setState(INITIAL_STATE);
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    upload: uploadFile,
    cancel,
    reset,
    isUploading: state.status === "uploading" || state.status === "confirming",
    isPreparing: state.status === "preparing",
    isIdle: state.status === "idle",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    isPending:
      requestUploadMutation.isPending || confirmUploadMutation.isPending,
  };
}

/**
 * Upload a file using the promise-based toast pattern
 *
 * This is a simpler alternative when you don't need fine-grained progress control.
 *
 * Usage:
 * ```ts
 * const { upload } = useFileUploadSimple();
 * const file = await upload(selectedFile, {
 *   entityType: 'profile',
 *   entityId: profileId,
 *   category: 'avatar',
 * });
 * ```
 */
export function useFileUploadSimple() {
  const trpc = useTRPC();

  const requestUploadMutation = useMutation({
    ...trpc.file.requestUpload.mutationOptions(),
  });

  const confirmUploadMutation = useMutation({
    ...trpc.file.confirmUpload.mutationOptions(),
  });

  const uploadWithToast = useCallback(
    async (
      file: File,
      options: {
        entityType: string;
        entityId: string;
        category: "video" | "document" | "image" | "avatar" | "attachment";
        visibility?: "public" | "private";
      }
    ): Promise<FileRecord> => {
      const uploadPromise = (async () => {
        // Step 1: Request upload session
        const session = await requestUploadMutation.mutateAsync({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          entityType: options.entityType,
          entityId: options.entityId,
          category: options.category,
        });

        // Step 2: Upload to Vercel Blob (pathname is overridden server-side with storageKey)
        const blob = await upload(session.storageKey, file, {
          access: "public",
          handleUploadUrl: "/api/storage/upload",
          clientPayload: JSON.stringify({
            sessionId: session.sessionId,
            clientToken: session.clientToken,
          }),
        });

        // Step 3: Confirm upload
        const fileRecord = await confirmUploadMutation.mutateAsync({
          sessionId: session.sessionId,
          url: blob.url,
          visibility: options.visibility ?? "public",
        });

        return fileRecord;
      })();

      return toastManager.promise(uploadPromise, {
        loading: "Uploading...",
        success: "Upload complete",
        error: (err) => (err instanceof Error ? err.message : "Upload failed"),
      });
    },
    [requestUploadMutation, confirmUploadMutation]
  );

  return {
    upload: uploadWithToast,
    isPending:
      requestUploadMutation.isPending || confirmUploadMutation.isPending,
  };
}
