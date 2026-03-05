import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { AudioPlayerView } from "./audio-player-view";

export interface AudioPlayerOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audioPlayer: {
      setAudioPlayer: (options: {
        src: string;
        title?: string;
        mimeType?: string;
      }) => ReturnType;
    };
  }
}

export const AudioPlayer = Node.create<AudioPlayerOptions>({
  name: "audioPlayer",
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
      title: { default: null },
      mimeType: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="audio-player"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "audio-player",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioPlayerView);
  },

  addCommands() {
    return {
      setAudioPlayer:
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
