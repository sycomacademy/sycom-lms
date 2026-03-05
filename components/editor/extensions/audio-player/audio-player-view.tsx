"use client";

import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { AudioLinesIcon } from "lucide-react";
import { cn } from "@/packages/utils/cn";

export function AudioPlayerView({ node, selected }: NodeViewProps) {
  const { src, title, mimeType } = node.attrs as {
    src: string;
    title?: string;
    mimeType?: string;
  };

  return (
    <NodeViewWrapper
      className={cn(
        "my-3 rounded-md border border-border bg-card p-3",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      data-type="audio-player"
    >
      <div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
        <AudioLinesIcon className="size-4" />
        <span className="truncate">{title || "Audio"}</span>
        {mimeType && <span className="truncate">{mimeType}</span>}
      </div>
      {/* biome-ignore lint/a11y/useMediaCaption: uploaded audio attachments do not have caption tracks */}
      <audio className="w-full" controls preload="metadata" src={src} />
    </NodeViewWrapper>
  );
}
