import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { VideoPlayerView } from "./video-player-view";

export interface VideoPlayerOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoPlayer: {
      setVideoPlayer: (options: {
        src: string;
        poster?: string;
        title?: string;
      }) => ReturnType;
    };
  }
}

export const VideoPlayer = Node.create<VideoPlayerOptions>({
  name: "videoPlayer",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      title: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="video-player"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "video-player",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoPlayerView);
  },

  addCommands() {
    return {
      setVideoPlayer:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
