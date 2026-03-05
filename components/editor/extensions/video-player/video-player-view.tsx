"use client";

import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeDisplay,
  VideoPlayerTimeRange,
  VideoPlayerVolumeRange,
} from "@/components/layout/video-player";

import { cn } from "@/packages/utils/cn";

export function VideoPlayerView({ node, selected }: NodeViewProps) {
  const { src, poster, title } = node.attrs as {
    src: string;
    poster?: string;
    title?: string;
  };

  return (
    <NodeViewWrapper
      className={cn(
        "my-3 overflow-hidden rounded-md border border-border bg-card",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      data-type="video-player"
    >
      {title ? (
        <div className="border-border border-b px-3 py-2 font-medium text-sm">
          {title}
        </div>
      ) : null}
      <VideoPlayer className="w-full" style={{ borderRadius: 0 }}>
        <VideoPlayerContent
          className="aspect-video w-full bg-black"
          playsInline
          poster={poster}
          slot="media"
          src={src}
        />
        <VideoPlayerControlBar className="">
          <VideoPlayerPlayButton />
          <VideoPlayerSeekBackwardButton seekOffset={10} />
          <VideoPlayerSeekForwardButton seekOffset={10} />
          <VideoPlayerTimeDisplay showDuration />
          <VideoPlayerTimeRange />
          <VideoPlayerMuteButton />
          <VideoPlayerVolumeRange />
        </VideoPlayerControlBar>
      </VideoPlayer>
    </NodeViewWrapper>
  );
}
