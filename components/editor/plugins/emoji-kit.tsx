"use client";

import emojiMartData from "@emoji-mart/data";
import { EmojiInputPlugin, EmojiPlugin } from "@platejs/emoji/react";

import { EmojiInputElement } from "@/components/editor/plate-ui/nodes/emoji-node";

export const EmojiKit = [
  EmojiPlugin.configure({
    // biome-ignore lint/suspicious/noExplicitAny: <we need to use any to avoid type errors>
    options: { data: emojiMartData as any },
  }),
  EmojiInputPlugin.withComponent(EmojiInputElement),
];
