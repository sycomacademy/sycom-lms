"use client";

import {
  BoldPlugin,
  HighlightPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { ParagraphPlugin } from "platejs/react";

import { HighlightLeaf } from "@/components/editor/plate-ui/highlight-node";

/**
 * Plugin kit for course summary editor.
 * Includes basic text formatting suitable for course descriptions.
 * No images, videos, code blocks, or other complex elements.
 */
export const SummaryKit = [
  ParagraphPlugin,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  HighlightPlugin.configure({
    node: { component: HighlightLeaf },
  }),
];
