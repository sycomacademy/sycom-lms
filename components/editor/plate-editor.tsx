"use client";

import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useId } from "react";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { CourseEditorKit } from "@/components/editor/editor-course-kit";
import { ToolbarButtons } from "@/components/editor/plate-ui/basic-toolbar-buttons";
import { CourseToolbarButtons } from "@/components/editor/plate-ui/course-toolbar-buttons";
import { Editor, EditorContainer } from "@/components/editor/plate-ui/editor";
import { FixedToolbar } from "@/components/editor/plate-ui/fixed-toolbar";

interface PlateEditorProps {
  value?: Value;
  onChange?: (value: Value) => void;
  variant?: "basic" | "course";
  placeholder?: string;
}

export const DEFAULT_EDITOR_VALUE: Value = [
  { type: "p", children: [{ text: "" }] },
];

export function PlateEditor({
  value = DEFAULT_EDITOR_VALUE,
  onChange,
  variant = "basic",
  placeholder = "Start typing...",
}: PlateEditorProps) {
  const id = useId();

  // Select kit based on variant
  const plugins = variant === "course" ? CourseEditorKit : BaseEditorKit;

  const editor = usePlateEditor({
    id: `plate-editor-${variant}`,
    // biome-ignore lint/suspicious/noExplicitAny: Plugin types are complex and don't unify across kits
    plugins: plugins as any,
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
        <FixedToolbar className="flex flex-nowrap justify-start gap-1 shadow-xs">
          {variant === "course" ? <CourseToolbarButtons /> : <ToolbarButtons />}
        </FixedToolbar>
        <EditorContainer variant={variant}>
          <Editor placeholder={placeholder} variant={variant} />
        </EditorContainer>
      </Plate>
    </div>
  );
}
