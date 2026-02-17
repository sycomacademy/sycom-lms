"use client";

import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useId } from "react";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { Editor, EditorContainer } from "@/components/editor/plate-ui/editor";
import { FixedToolbar } from "@/components/editor/plate-ui/fixed-toolbar";
import { ToolbarButtons } from "@/components/editor/plate-ui/toolbar-buttons";

interface PlateEditorProps {
  value?: Value;
  onChange?: (value: Value) => void;
  variant?: "basic" | "course";
  placeholder?: string;
}

const DEFAULT_VALUE: Value = [{ type: "p", children: [{ text: "" }] }];

export function PlateEditor({
  value = DEFAULT_VALUE,
  onChange,
  variant = "basic",
  placeholder = "Start typing...",
}: PlateEditorProps) {
  const id = useId();

  const editor = usePlateEditor({
    plugins: BaseEditorKit,
    value,
  });

  return (
    <div id={id}>
      <Plate
        editor={editor}
        onValueChange={({ value: newValue }) => {
          onChange?.(newValue);
        }}
      >
        <FixedToolbar className="flex justify-start gap-1 shadow-xs">
          <ToolbarButtons />
        </FixedToolbar>
        <EditorContainer variant={variant}>
          <Editor placeholder={placeholder} variant={variant} />
        </EditorContainer>
      </Plate>
    </div>
  );
}
