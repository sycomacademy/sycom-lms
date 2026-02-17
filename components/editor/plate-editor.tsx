"use client";

import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useId } from "react";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { ToolbarButtons } from "@/components/editor/plate-ui/basic-toolbar-buttons";
import { CourseToolbarButtons } from "@/components/editor/plate-ui/course-toolbar-buttons";
import { Editor, EditorContainer } from "@/components/editor/plate-ui/editor";
import { FixedToolbar } from "@/components/editor/plate-ui/fixed-toolbar";

interface PlateEditorProps {
  value?: Value;
  onChange?: (value: Value) => void;
  variant?: "basic" | "course" | "none";
  placeholder?: string;
  readonly?: boolean;
}

export const DEFAULT_EDITOR_VALUE: Value = [
  { type: "p", children: [{ text: "" }] },
];

export function PlateEditor({
  readonly = false,
  value = DEFAULT_EDITOR_VALUE,
  onChange,
  variant = "basic",
  placeholder = "Start typing...",
}: PlateEditorProps) {
  const id = useId();

  // Select kit based on variant
  // const plugins = variant === "course" ? CourseEditorKit : BaseEditorKit;

  const editor = usePlateEditor({
    id: `plate-editor-${variant}`,
    plugins: BaseEditorKit,
    value,
    readOnly: readonly,
  });

  return (
    <div id={id}>
      <Plate
        editor={editor}
        onValueChange={
          readonly
            ? undefined
            : ({ value: newValue }) => {
                onChange?.(newValue);
              }
        }
      >
        {variant !== "none" && (
          <FixedToolbar className="flex flex-nowrap justify-start gap-1 shadow-xs">
            {variant === "course" ? (
              <CourseToolbarButtons />
            ) : (
              <ToolbarButtons />
            )}
          </FixedToolbar>
        )}
        <EditorContainer variant={variant}>
          <Editor placeholder={placeholder} variant={variant} />
        </EditorContainer>
      </Plate>
    </div>
  );
}
