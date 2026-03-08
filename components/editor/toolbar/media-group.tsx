"use client";

import { useMutation } from "@tanstack/react-query";
import type { Editor } from "@tiptap/react";
import {
  CircleHelpIcon,
  FileIcon,
  ImageIcon,
  Loader2Icon,
  MusicIcon,
  UploadIcon,
  VideoIcon,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverClose,
  PopoverPopup,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toastManager } from "@/components/ui/toast";
import { ToolbarGroup } from "@/components/ui/toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  StorageEntityType,
  StorageFolder,
} from "@/packages/db/schema/storage";
import { uploadFile } from "@/packages/storage/upload";
import { useTRPC } from "@/packages/trpc/client";

const CONTENT_FOLDER = "course-content" satisfies StorageFolder;

interface MediaGroupProps {
  editor: Editor;
  mediaUploadOwnerId?: string;
  mediaUploadEntityType?: StorageEntityType;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }
      reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function MediaGroup({
  editor,
  mediaUploadOwnerId,
  mediaUploadEntityType = "lesson",
}: MediaGroupProps) {
  const trpc = useTRPC();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [uploadingType, setUploadingType] = useState<
    "image" | "video" | "audio" | "file" | null
  >(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const signUploadMutation = useMutation(
    trpc.storage.signUpload.mutationOptions()
  );
  const saveAssetMutation = useMutation(
    trpc.storage.saveAsset.mutationOptions()
  );

  const uploadToCloudinary = useCallback(
    async (file: File, ownerId: string): Promise<string> => {
      const signedParams = await signUploadMutation.mutateAsync({
        folder: CONTENT_FOLDER,
        entityId: ownerId,
      });
      const result = await uploadFile({ file, signedParams });
      await saveAssetMutation.mutateAsync({
        publicId: result.publicId,
        secureUrl: result.secureUrl,
        folder: CONTENT_FOLDER,
        resourceType: result.resourceType,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        entityId: ownerId,
        entityType: mediaUploadEntityType,
      });
      return result.secureUrl;
    },
    [mediaUploadEntityType, signUploadMutation, saveAssetMutation]
  );

  const getSrc = useCallback(
    async (file: File): Promise<string> => {
      if (mediaUploadOwnerId) {
        return uploadToCloudinary(file, mediaUploadOwnerId);
      }
      return fileToDataUrl(file);
    },
    [mediaUploadOwnerId, uploadToCloudinary]
  );

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      event.target.value = "";
      setUploadingType("image");
      try {
        const src = await getSrc(file);
        editor.chain().focus().setImage({ src }).run();
      } catch (err) {
        toastManager.add({
          title: "Failed to upload image",
          description: err instanceof Error ? err.message : "Unknown error",
          type: "error",
        });
      } finally {
        setUploadingType(null);
      }
    },
    [editor, getSrc]
  );

  const handleVideoUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      event.target.value = "";
      setUploadingType("video");
      try {
        const src = await getSrc(file);
        editor.chain().focus().setVideoPlayer({ src, title: file.name }).run();
      } catch (err) {
        toastManager.add({
          title: "Failed to upload video",
          description: err instanceof Error ? err.message : "Unknown error",
          type: "error",
        });
      } finally {
        setUploadingType(null);
      }
    },
    [editor, getSrc]
  );

  const handleAudioUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      event.target.value = "";
      setUploadingType("audio");
      try {
        const src = await getSrc(file);
        editor
          .chain()
          .focus()
          .setAudioPlayer({ src, title: file.name, mimeType: file.type })
          .run();
      } catch (err) {
        toastManager.add({
          title: "Failed to upload audio",
          description: err instanceof Error ? err.message : "Unknown error",
          type: "error",
        });
      } finally {
        setUploadingType(null);
      }
    },
    [editor, getSrc]
  );

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      event.target.value = "";
      setUploadingType("file");
      try {
        const href = await getSrc(file);
        editor
          .chain()
          .focus()
          .setFileAttachment({
            href,
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            mimeType: file.type || "application/octet-stream",
          })
          .run();
      } catch (err) {
        toastManager.add({
          title: "Failed to upload file",
          description: err instanceof Error ? err.message : "Unknown error",
          type: "error",
        });
      } finally {
        setUploadingType(null);
      }
    },
    [editor, getSrc]
  );

  const isUploading = uploadingType !== null;

  const handleYoutubeSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      const src = youtubeUrl.trim();
      if (!src) {
        return;
      }

      editor.chain().focus().setYoutubeVideo({ src }).run();
      setYoutubeUrl("");
    },
    [editor, youtubeUrl]
  );

  return (
    <ToolbarGroup>
      <input
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
        ref={imageInputRef}
        type="file"
      />
      <input
        accept="video/*"
        className="hidden"
        onChange={handleVideoUpload}
        ref={videoInputRef}
        type="file"
      />
      <input
        accept="audio/*"
        className="hidden"
        onChange={handleAudioUpload}
        ref={audioInputRef}
        type="file"
      />
      <input
        className="hidden"
        onChange={handleFileUpload}
        ref={fileInputRef}
        type="file"
      />

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              disabled={isUploading}
              onClick={() => imageInputRef.current?.click()}
              size="icon-xs"
              variant="ghost"
            />
          }
        >
          {uploadingType === "image" ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <ImageIcon className="size-4" />
          )}
        </TooltipTrigger>
        <TooltipContent>Insert Image</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              disabled={isUploading}
              onClick={() => audioInputRef.current?.click()}
              size="icon-xs"
              variant="ghost"
            />
          }
        >
          {uploadingType === "audio" ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <MusicIcon className="size-4" />
          )}
        </TooltipTrigger>
        <TooltipContent>Insert Audio</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              size="icon-xs"
              variant="ghost"
            />
          }
        >
          {uploadingType === "file" ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <FileIcon className="size-4" />
          )}
        </TooltipTrigger>
        <TooltipContent>Insert File</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .setQuizBlock({
                    question: "Your question here?",
                    options: ["Option A", "Option B", "Option C", "Option D"],
                    correctIndex: 0,
                    correctIndexes: [0],
                    allowMultiple: false,
                  })
                  .run();
              }}
              size="icon-xs"
              variant="ghost"
            />
          }
        >
          <CircleHelpIcon className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Insert Quiz</TooltipContent>
      </Tooltip>

      <Popover>
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={<Button size="icon-xs" variant="ghost" />}
              />
            }
          >
            <VideoIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Insert Video</TooltipContent>
        </Tooltip>
        <PopoverPopup align="start" side="bottom" sideOffset={8}>
          <div className="w-72 space-y-3">
            <form
              className="flex items-center gap-2"
              onSubmit={handleYoutubeSubmit}
            >
              <Input
                className="h-8 w-full text-xs"
                onChange={(event) => setYoutubeUrl(event.target.value)}
                placeholder="YouTube URL..."
                value={youtubeUrl}
              />
              <PopoverClose render={<Button size="sm" type="submit" />}>
                Embed
              </PopoverClose>
            </form>
            <Button
              className="w-full"
              disabled={isUploading}
              onClick={() => videoInputRef.current?.click()}
              size="sm"
              variant="outline"
            >
              {uploadingType === "video" ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <UploadIcon className="size-4" />
              )}
              Upload Video
            </Button>
          </div>
        </PopoverPopup>
      </Popover>
    </ToolbarGroup>
  );
}
