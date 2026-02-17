"use client";

import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useEffect, useId, useRef } from "react";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { Editor, EditorContainer } from "@/components/editor/plate-ui/editor";
import { FixedToolbar } from "@/components/editor/plate-ui/fixed-toolbar";
import { ToolbarButtons } from "@/components/editor/plate-ui/toolbar-buttons";

interface PlateEditorProps {
  /** Initial value for the editor. Changes after mount are ignored unless using a key prop. */
  initialValue?: Value;
  /**
   * @deprecated Use `initialValue` instead. This prop is kept for compatibility
   * but will cause the editor to be recreated on value changes if used incorrectly.
   */
  value?: Value;
  onChange?: (value: Value) => void;
  variant?: "basic" | "course";
  placeholder?: string;
}

/** Valid minimal editor value. Use when value is missing/empty to avoid Slate DOM resolution errors. */
export const DEFAULT_EDITOR_VALUE: Value = [
  { type: "p", children: [{ text: "" }] },
];

export function PlateEditor({
  initialValue,
  value,
  onChange,
  variant = "basic",
  placeholder = "Start typing...",
}: PlateEditorProps) {
  const id = useId();

  // Use initialValue if provided, otherwise fall back to value (for backwards compatibility)
  const startValue = initialValue ?? value ?? DEFAULT_EDITOR_VALUE;

  // Track the initial value to avoid recreating editor on prop changes
  const initialValueRef = useRef(startValue);

  const editor = usePlateEditor({
    id,
    plugins: BaseEditorKit,
    // Only use the initial value - editor state is managed internally after mount
    value: initialValueRef.current,
  });

  // Handle external value resets (e.g., form reset) - only when value reference changes significantly
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // If value prop changes to a completely different value after mount,
    // and it's different from current editor content, reset the editor.
    // This handles cases like form resets.
    if (value !== undefined && value !== initialValueRef.current) {
      // Check if value is structurally different (not just a reference change from onChange)
      const currentValue = editor.children;
      const valueStr = JSON.stringify(value);
      const currentStr = JSON.stringify(currentValue);

      if (valueStr !== currentStr) {
        // Reset selection/history and set new value
        editor.tf.reset();
        editor.tf.setValue(value);
        initialValueRef.current = value;
      }
    }
  }, [value, editor]);

  return (
    <div>
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
