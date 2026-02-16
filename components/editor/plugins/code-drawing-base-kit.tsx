import { BaseCodeDrawingPlugin } from "@platejs/code-drawing";

import { CodeDrawingElement } from "@/components/editor/plate-ui/code-drawing-node";

export const BaseCodeDrawingKit = [
  BaseCodeDrawingPlugin.configure({
    node: { component: CodeDrawingElement },
  }),
];
