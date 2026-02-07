"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  StrikethroughIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/packages/utils/cn";

interface RichTextEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  name,
  defaultValue = "",
  placeholder = "Write something…",
  className,
  minHeight = "min-h-32",
}: RichTextEditorProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none px-3 py-2",
      },
    },
  });

  const syncToHiddenInput = useCallback(() => {
    const input = hiddenInputRef.current;
    if (input && editor) {
      input.value = editor.getHTML();
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    syncToHiddenInput();
    editor.on("update", syncToHiddenInput);
    return () => {
      editor.off("update", syncToHiddenInput);
    };
  }, [editor, syncToHiddenInput]);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-input bg-background",
        className
      )}
    >
      <input
        defaultValue={defaultValue}
        name={name}
        ref={hiddenInputRef}
        type="hidden"
      />
      <div className="flex flex-wrap gap-1 border-border border-b bg-muted/30 p-1">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          size="icon-xs"
          type="button"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
        >
          <BoldIcon className="size-3.5" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          size="icon-xs"
          type="button"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
        >
          <ItalicIcon className="size-3.5" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          size="icon-xs"
          type="button"
          variant={editor.isActive("strike") ? "secondary" : "ghost"}
        >
          <StrikethroughIcon className="size-3.5" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          size="icon-xs"
          type="button"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
        >
          <ListIcon className="size-3.5" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          size="icon-xs"
          type="button"
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
        >
          <ListOrderedIcon className="size-3.5" />
        </Button>
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          size="icon-xs"
          type="button"
          variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
        >
          <QuoteIcon className="size-3.5" />
        </Button>
      </div>
      <div className={cn(minHeight, "overflow-auto")}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
