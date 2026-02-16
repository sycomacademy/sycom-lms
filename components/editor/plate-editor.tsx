"use client";

import {
  Bold,
  Highlighter,
  Italic,
  Strikethrough,
  Underline,
} from "lucide-react";
import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import type { EditorProps } from "@/components/editor/nodes/editor";
import { Editor, EditorContainer } from "@/components/editor/nodes/editor";
import { FixedToolbar } from "@/components/editor/nodes/fixed-toolbar";
import { MarkToolbarButton } from "@/components/editor/nodes/mark-toolbar-button";
import { BasicNodesKit } from "@/components/editor/plugins/basic-nodes-kit";
import { SummaryKit } from "@/components/editor/plugins/summary-kit";
import { ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface PlateEditorProps {
  /** Initial / controlled value (Plate JSON). */
  value?: Value;
  /** Called on every change with the latest editor value. */
  onChange?: (value: Value) => void;
  /** Placeholder shown when editor is empty. */
  placeholder?: string;
  /** Whether the editor is read-only. */
  readOnly?: boolean;
  /** Editor variant - 'default' for full editor, 'summary' for minimal */
  variant?: "default" | "summary";
}

const EMPTY_VALUE: Value = [{ type: "p", children: [{ text: "" }] }];

export function PlateEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  readOnly = false,
  variant = "default",
}: PlateEditorProps) {
  const plugins = variant === "summary" ? SummaryKit : BasicNodesKit;

  const editor = usePlateEditor({
    plugins,
    value: value && value.length > 0 ? value : EMPTY_VALUE,
  });

  const editorVariant: EditorProps["variant"] =
    variant === "summary" ? "summary" : "default";

  return (
    <Plate
      editor={editor}
      onChange={onChange ? ({ value: v }) => onChange(v) : undefined}
      readOnly={readOnly}
    >
      {!readOnly && (
        <TooltipProvider>
          <FixedToolbar className="justify-start rounded-t-lg border border-input border-b-0">
            <ToolbarGroup aria-label="Text formatting">
              <MarkToolbarButton
                aria-label="Bold"
                nodeType="bold"
                tooltip="Bold (⌘B)"
              >
                <Bold />
              </MarkToolbarButton>
              <MarkToolbarButton
                aria-label="Italic"
                nodeType="italic"
                tooltip="Italic (⌘I)"
              >
                <Italic />
              </MarkToolbarButton>
              <MarkToolbarButton
                aria-label="Underline"
                nodeType="underline"
                tooltip="Underline (⌘U)"
              >
                <Underline />
              </MarkToolbarButton>
            </ToolbarGroup>
            {variant === "summary" && (
              <>
                <ToolbarSeparator orientation="vertical" />
                <ToolbarGroup aria-label="Additional formatting">
                  <MarkToolbarButton
                    aria-label="Strikethrough"
                    nodeType="strikethrough"
                    tooltip="Strikethrough (⌘⇧X)"
                  >
                    <Strikethrough />
                  </MarkToolbarButton>
                  <MarkToolbarButton
                    aria-label="Highlight"
                    nodeType="highlight"
                    tooltip="Highlight (⌘⇧H)"
                  >
                    <Highlighter />
                  </MarkToolbarButton>
                </ToolbarGroup>
              </>
            )}
          </FixedToolbar>
        </TooltipProvider>
      )}

      <EditorContainer
        className="min-h-[120px] rounded-b-lg border border-input"
        variant={readOnly ? "default" : editorVariant}
      >
        <Editor placeholder={placeholder} variant={editorVariant} />
      </EditorContainer>
    </Plate>
  );
}
