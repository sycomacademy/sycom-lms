"use client";

import {
  BoldPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import {
  BoldIcon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  PilcrowIcon,
  QuoteIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { Editor, EditorContainer } from "@/components/editor/nodes/editor";
import { FixedToolbar } from "@/components/editor/nodes/fixed-toolbar";
import { MarkToolbarButton } from "@/components/editor/nodes/mark-toolbar-button";
import { BasicNodesKit } from "@/components/editor/plugins/basic-nodes-kit";
import { ToolbarButton, ToolbarGroup } from "@/components/ui/toolbar";

interface PlateEditorProps {
  /** Initial / controlled value (Plate JSON). */
  value?: Value;
  /** Called on every change with the latest editor value. */
  onChange?: (value: Value) => void;
  /** Placeholder shown when editor is empty. */
  placeholder?: string;
  /** Whether the editor is read-only. */
  readOnly?: boolean;
}

const EMPTY_VALUE: Value = [{ type: "p", children: [{ text: "" }] }];

export function PlateEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  readOnly = false,
}: PlateEditorProps) {
  const editor = usePlateEditor({
    plugins: BasicNodesKit,
    value: value && value.length > 0 ? value : EMPTY_VALUE,
  });

  return (
    <Plate
      editor={editor}
      onChange={onChange ? ({ value: v }) => onChange(v) : undefined}
      readOnly={readOnly}
    >
      {!readOnly && (
        <FixedToolbar className="justify-start rounded-t-lg border border-input border-b-0">
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.tf.p.toggle()}
              tooltip="Paragraph"
            >
              <PilcrowIcon className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.tf.h2.toggle()}
              tooltip="Heading 2 (Ctrl+Alt+2)"
            >
              <Heading2Icon className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.tf.h3.toggle()}
              tooltip="Heading 3 (Ctrl+Alt+3)"
            >
              <Heading3Icon className="size-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.tf.blockquote.toggle()}
              tooltip="Blockquote (Ctrl+Shift+.)"
            >
              <QuoteIcon className="size-4" />
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <MarkToolbarButton
              nodeType={BoldPlugin.key}
              tooltip="Bold (Ctrl+B)"
            >
              <BoldIcon className="size-4" />
            </MarkToolbarButton>
            <MarkToolbarButton
              nodeType={ItalicPlugin.key}
              tooltip="Italic (Ctrl+I)"
            >
              <ItalicIcon className="size-4" />
            </MarkToolbarButton>
            <MarkToolbarButton
              nodeType={UnderlinePlugin.key}
              tooltip="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="size-4" />
            </MarkToolbarButton>
            <MarkToolbarButton
              nodeType={StrikethroughPlugin.key}
              tooltip="Strikethrough (Ctrl+Shift+X)"
            >
              <StrikethroughIcon className="size-4" />
            </MarkToolbarButton>
          </ToolbarGroup>
        </FixedToolbar>
      )}

      <EditorContainer
        className="min-h-[200px] rounded-b-lg border border-input"
        variant="default"
      >
        <Editor
          className="px-4 pt-2 pb-4 text-sm"
          placeholder={placeholder}
          variant="fullWidth"
        />
      </EditorContainer>
    </Plate>
  );
}
