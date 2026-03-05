"use client";

import { EditorBubbleMenu } from "@/components/editor/bubble-menu";
import { EditorContentArea } from "@/components/editor/editor-content";
import { useEditorInstance } from "@/components/editor/hooks/use-editor-instance";
import { ImageBubbleMenu } from "@/components/editor/image-bubble-menu";
import { TableBubbleMenu } from "@/components/editor/table-bubble-menu";
import { EditorToolbar } from "@/components/editor/toolbar/editor-toolbar";
import type { EditorProps } from "@/components/editor/types";
import { cn } from "@/packages/utils/cn";

import "@/components/editor/editor.css";

export function Editor({
  variant = "basic",
  content,
  onUpdate,
  onBlur,
  editable = true,
  placeholder,
  className,
  autofocus = false,
}: EditorProps) {
  const editor = useEditorInstance({
    variant,
    content,
    editable,
    placeholder,
    autofocus,
    onUpdate,
    onBlur,
  });

  return (
    <div
      className={cn(
        "editor-wrapper rounded-md border border-input bg-background text-foreground transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50",
        !editable && "cursor-default opacity-80",
        className
      )}
      data-readonly={!editable}
      data-variant={variant}
    >
      {editor && editable && variant !== "bare" && (
        <EditorToolbar editor={editor} variant={variant} />
      )}
      {editor && editable && variant === "full" && (
        <>
          <EditorBubbleMenu editor={editor} />
          <ImageBubbleMenu editor={editor} />
          <TableBubbleMenu editor={editor} />
        </>
      )}
      <EditorContentArea editor={editor} />
    </div>
  );
}
