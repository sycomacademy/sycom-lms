"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Columns3Icon,
  MergeIcon,
  Rows3Icon,
  SplitIcon,
  Trash2Icon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TableBubbleMenuProps {
  editor: Editor;
}

export function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  return (
    <BubbleMenu
      className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg"
      editor={editor}
      shouldShow={({ editor: e }) => e.isActive("table")}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onMouseDown={(event) => event.preventDefault()}
                onPressedChange={() =>
                  editor.chain().focus().mergeCells().run()
                }
                size="sm"
              />
            }
          >
            <MergeIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Merge Cells</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onMouseDown={(event) => event.preventDefault()}
                onPressedChange={() => editor.chain().focus().splitCell().run()}
                size="sm"
              />
            }
          >
            <SplitIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Split Cell</TooltipContent>
        </Tooltip>

        <Separator className="mx-0.5 h-5" orientation="vertical" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onMouseDown={(event) => event.preventDefault()}
                onPressedChange={() =>
                  editor.chain().focus().addColumnBefore().run()
                }
                size="sm"
              />
            }
          >
            <Columns3Icon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Add Column Before</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onMouseDown={(event) => event.preventDefault()}
                onPressedChange={() =>
                  editor.chain().focus().addColumnAfter().run()
                }
                size="sm"
              />
            }
          >
            <Columns3Icon className="size-4 rotate-180" />
          </TooltipTrigger>
          <TooltipContent>Add Column After</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onMouseDown={(event) => event.preventDefault()}
                onPressedChange={() =>
                  editor.chain().focus().deleteColumn().run()
                }
                size="sm"
              />
            }
          >
            <Columns3Icon className="size-4 text-destructive" />
          </TooltipTrigger>
          <TooltipContent>Delete Column</TooltipContent>
        </Tooltip>

        <Separator className="mx-0.5 h-5" orientation="vertical" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onMouseDown={(event) => event.preventDefault()}
                onPressedChange={() =>
                  editor.chain().focus().addRowBefore().run()
                }
                size="sm"
              />
            }
          >
            <Rows3Icon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Add Row Before</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onMouseDown={(event) => event.preventDefault()}
                onPressedChange={() =>
                  editor.chain().focus().addRowAfter().run()
                }
                size="sm"
              />
            }
          >
            <Rows3Icon className="size-4 rotate-180" />
          </TooltipTrigger>
          <TooltipContent>Add Row After</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onMouseDown={(event) => event.preventDefault()}
                onPressedChange={() => editor.chain().focus().deleteRow().run()}
                size="sm"
              />
            }
          >
            <Rows3Icon className="size-4 text-destructive" />
          </TooltipTrigger>
          <TooltipContent>Delete Row</TooltipContent>
        </Tooltip>

        <Separator className="mx-0.5 h-5" orientation="vertical" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onMouseDown={(event) => event.preventDefault()}
                onPressedChange={() =>
                  editor.chain().focus().deleteTable().run()
                }
                size="sm"
              />
            }
          >
            <Trash2Icon className="size-4 text-destructive" />
          </TooltipTrigger>
          <TooltipContent>Delete Table</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </BubbleMenu>
  );
}
