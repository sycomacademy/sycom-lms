import { BaseCaptionPlugin } from "@platejs/caption";
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from "@platejs/media/react";
import { KEYS } from "platejs";

import { AudioElement } from "@/components/editor/plate-ui/nodes/media-audio-node";
import { FileElement } from "@/components/editor/plate-ui/nodes/media-file-node";
import { ImageElement } from "@/components/editor/plate-ui/nodes/media-image-node";
import { VideoElement } from "@/components/editor/plate-ui/nodes/media-video-node";

export const BaseMediaKit = [
  ImagePlugin.withComponent(ImageElement),
  VideoPlugin.withComponent(VideoElement),
  AudioPlugin.withComponent(AudioElement),
  FilePlugin.withComponent(FileElement),
  BaseCaptionPlugin.configure({
    options: {
      query: {
        allow: [KEYS.img, KEYS.video, KEYS.audio, KEYS.file, KEYS.mediaEmbed],
      },
    },
  }),
  MediaEmbedPlugin,
  PlaceholderPlugin,
];
