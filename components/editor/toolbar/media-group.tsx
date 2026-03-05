"use client";

import type { Editor } from "@tiptap/react";
import {
  CircleHelpIcon,
  FileIcon,
  ImageIcon,
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
import { ToolbarGroup } from "@/components/ui/toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MediaGroupProps {
  editor: Editor;
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

export function MediaGroup({ editor }: MediaGroupProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const src = await fileToDataUrl(file);
      editor.chain().focus().setImage({ src }).run();
      event.target.value = "";
    },
    [editor]
  );

  const handleVideoUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const src = await fileToDataUrl(file);
      editor.chain().focus().setVideoPlayer({ src, title: file.name }).run();
      event.target.value = "";
    },
    [editor]
  );

  const handleAudioUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const src = await fileToDataUrl(file);
      editor
        .chain()
        .focus()
        .setAudioPlayer({ src, title: file.name, mimeType: file.type })
        .run();
      event.target.value = "";
    },
    [editor]
  );

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const href = await fileToDataUrl(file);
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
      event.target.value = "";
    },
    [editor]
  );

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
              onClick={() => imageInputRef.current?.click()}
              size="icon-xs"
              variant="ghost"
            />
          }
        >
          <ImageIcon className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Insert Image</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={() => audioInputRef.current?.click()}
              size="icon-xs"
              variant="ghost"
            />
          }
        >
          <MusicIcon className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Insert Audio</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="icon-xs"
              variant="ghost"
            />
          }
        >
          <FileIcon className="size-4" />
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
              onClick={() => videoInputRef.current?.click()}
              size="sm"
              variant="outline"
            >
              <UploadIcon className="size-4" />
              Upload Video
            </Button>
          </div>
        </PopoverPopup>
      </Popover>
    </ToolbarGroup>
  );
}
