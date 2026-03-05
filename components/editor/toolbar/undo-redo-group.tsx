"use client";

import type { Editor } from "@tiptap/react";
import { RedoIcon, UndoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolbarGroup } from "@/components/ui/toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UndoRedoGroupProps {
  editor: Editor;
}

export function UndoRedoGroup({ editor }: UndoRedoGroupProps) {
  return (
    <ToolbarGroup>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              disabled={!editor.can().chain().focus().undo().run()}
              onClick={() => editor.chain().focus().undo().run()}
              onMouseDown={(event) => event.preventDefault()}
              size="icon-xs"
              variant="ghost"
            />
          }
        >
          <UndoIcon className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Undo</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              disabled={!editor.can().chain().focus().redo().run()}
              onClick={() => editor.chain().focus().redo().run()}
              onMouseDown={(event) => event.preventDefault()}
              size="icon-xs"
              variant="ghost"
            />
          }
        >
          <RedoIcon className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Redo</TooltipContent>
      </Tooltip>
    </ToolbarGroup>
  );
}
