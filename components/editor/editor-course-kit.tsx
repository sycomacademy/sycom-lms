// "use client";

// import type { Value } from "platejs";
// import { type TPlateEditor, useEditorRef } from "platejs/react";

// import { AlignKit } from "@/components/editor/plugins/align-kit";
// import { AutoformatKit } from "@/components/editor/plugins/autoformat-kit";
// import { BasicBlocksKit } from "@/components/editor/plugins/basic-blocks-kit";
// import { BasicMarksKit } from "@/components/editor/plugins/basic-marks-kit";
// import { BlockMenuKit } from "@/components/editor/plugins/block-menu-kit";
// import { CalloutKit } from "@/components/editor/plugins/callout-kit";
// import { CodeBlockKit } from "@/components/editor/plugins/code-block-kit";
// import { CursorOverlayKit } from "@/components/editor/plugins/cursor-overlay-kit";
// import { DndKit } from "@/components/editor/plugins/dnd-kit";
// import { ExitBreakKit } from "@/components/editor/plugins/exit-break-kit";
// import { FontKit } from "@/components/editor/plugins/font-kit";
// import { LineHeightKit } from "@/components/editor/plugins/line-height-kit";
// import { LinkKit } from "@/components/editor/plugins/link-kit";
// import { ListKit } from "@/components/editor/plugins/list-kit";
// import { MathKit } from "@/components/editor/plugins/math-kit";
// import { SlashKit } from "@/components/editor/plugins/slash-kit";
// import { TableKit } from "@/components/editor/plugins/table-kit";
// import { TocKit } from "@/components/editor/plugins/toc-kit";
// import { ToggleKit } from "@/components/editor/plugins/toggle-kit";

// export const CourseEditorKit = [
//   // Elements
//   ...BasicBlocksKit,
//   ...CodeBlockKit,
//   ...TableKit,
//   ...ToggleKit,
//   ...TocKit,
//   // ...MediaKit,
//   ...CalloutKit,
//   // ...ColumnKit,
//   ...MathKit,
//   ...LinkKit,

//   // Marks
//   ...BasicMarksKit,
//   ...FontKit,

//   // Block Style
//   ...ListKit,
//   ...AlignKit,
//   ...LineHeightKit,

//   // Collaboration

//   // Editing
//   ...SlashKit,
//   ...AutoformatKit,
//   ...CursorOverlayKit,
//   ...BlockMenuKit,
//   ...DndKit,
//   // ...EmojiKit,
//   ...ExitBreakKit,
//   // TrailingBlockPlugin,

//   // Parsers
//   // ...DocxKit,
//   // ...MarkdownKit,

//   // UI
//   // ...BlockPlaceholderKit,
//   // ...FixedToolbarKit,
//   // ...FloatingToolbarKit,
// ];

// export type MyEditor = TPlateEditor<Value, (typeof CourseEditorKit)[number]>;

// export const useEditor = () => useEditorRef<MyEditor>();
