"use client";

import type { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import type { ToolbarProps } from "@/components/editor/types";
import { Toolbar, ToolbarSeparator } from "@/components/ui/toolbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlignmentGroup } from "./alignment-group";
import { FormattingGroup } from "./formatting-group";
import { HeadingGroup } from "./heading-group";
import { LinkPopover } from "./link-popover";
import { ListGroup } from "./list-group";
import { MediaGroup } from "./media-group";
import { TableGroup } from "./table-group";
import { UndoRedoGroup } from "./undo-redo-group";

function useEditorRerender(editor: Editor) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    editor.on("transaction", handler);
    return () => {
      editor.off("transaction", handler);
    };
  }, [editor]);
}

export function EditorToolbar({ editor, variant }: ToolbarProps) {
  useEditorRerender(editor);

  if (variant === "bare") {
    return null;
  }

  const isFull = variant === "full";

  return (
    <TooltipProvider>
      <Toolbar className="flex-wrap rounded-none rounded-t-md border-x-0 border-t-0 border-b bg-muted/30">
        <UndoRedoGroup editor={editor} />
        <ToolbarSeparator />
        <HeadingGroup editor={editor} />
        <ToolbarSeparator />
        <FormattingGroup editor={editor} />
        <ToolbarSeparator />
        <ListGroup editor={editor} showTaskList />
        <ToolbarSeparator />
        <LinkPopover editor={editor} />

        {isFull && (
          <>
            <ToolbarSeparator />
            <AlignmentGroup editor={editor} />
            <ToolbarSeparator />
            <TableGroup editor={editor} />
            <ToolbarSeparator />
            <MediaGroup editor={editor} />
          </>
        )}
      </Toolbar>
    </TooltipProvider>
  );
}
