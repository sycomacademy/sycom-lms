"use client";

import type { Editor } from "@tiptap/react";
import { EditorContent as TiptapEditorContent } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { cn } from "@/packages/utils/cn";

interface EditorContentWrapperProps {
  editor: Editor | null;
  className?: string;
}

export function EditorContentArea({
  editor,
  className,
}: EditorContentWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const root = editor.view.dom;
    const HANDLE_ZONE_PX = 12;
    const MIN_WIDTH_PX = 80;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLImageElement)) {
        return;
      }

      const rect = target.getBoundingClientRect();
      const fromLeft = Math.abs(event.clientX - rect.left);
      const fromRight = Math.abs(rect.right - event.clientX);
      let edge: "left" | "right" | null = null;

      if (fromLeft <= HANDLE_ZONE_PX) {
        edge = "left";
      } else if (fromRight <= HANDLE_ZONE_PX) {
        edge = "right";
      }

      if (!edge) {
        return;
      }

      event.preventDefault();

      const editorRect = root.getBoundingClientRect();
      const startX = event.clientX;
      const startWidth = rect.width;
      let latestWidth = rect.width;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const adjustedDelta = edge === "left" ? -deltaX : deltaX;
        const nextWidth = Math.max(
          MIN_WIDTH_PX,
          Math.min(editorRect.width, startWidth + adjustedDelta)
        );

        latestWidth = nextWidth;
        target.style.width = `${nextWidth}px`;
      };

      const onPointerUp = () => {
        const widthPercent = Math.max(
          5,
          Math.min(100, (latestWidth / editorRect.width) * 100)
        );

        editor
          .chain()
          .focus()
          .updateAttributes("image", { width: `${Math.round(widthPercent)}%` })
          .run();

        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
      };

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
    };

    root.addEventListener("pointerdown", onPointerDown);

    return () => {
      root.removeEventListener("pointerdown", onPointerDown);
    };
  }, [editor]);

  useEffect(() => {
    if (!(editor && containerRef.current)) {
      return;
    }

    const container = containerRef.current;

    const onContainerMouseDown = (event: MouseEvent) => {
      if (event.target !== container) {
        return;
      }

      event.preventDefault();
      editor.chain().focus("end").run();
    };

    container.addEventListener("mousedown", onContainerMouseDown);

    return () => {
      container.removeEventListener("mousedown", onContainerMouseDown);
    };
  }, [editor]);

  return (
    <div
      className={cn("editor-content min-h-80 px-4 py-3", className)}
      ref={containerRef}
    >
      <TiptapEditorContent editor={editor} />
    </div>
  );
}
