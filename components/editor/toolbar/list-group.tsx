"use client";

import type { Editor } from "@tiptap/react";
import { ListIcon, ListOrderedIcon, ListTodoIcon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ToolbarGroup } from "@/components/ui/toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ListGroupProps {
  editor: Editor;
  showTaskList?: boolean;
}

export function ListGroup({ editor, showTaskList = false }: ListGroupProps) {
  return (
    <ToolbarGroup>
      <Tooltip>
        <TooltipTrigger
          render={
            <Toggle
              onPressedChange={() =>
                editor.chain().focus().toggleBulletList().run()
              }
              pressed={editor.isActive("bulletList")}
              size="sm"
            />
          }
        >
          <ListIcon className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Bullet List</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Toggle
              onPressedChange={() =>
                editor.chain().focus().toggleOrderedList().run()
              }
              pressed={editor.isActive("orderedList")}
              size="sm"
            />
          }
        >
          <ListOrderedIcon className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Ordered List</TooltipContent>
      </Tooltip>

      {showTaskList && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onPressedChange={() =>
                  editor.chain().focus().toggleTaskList().run()
                }
                pressed={editor.isActive("taskList")}
                size="sm"
              />
            }
          >
            <ListTodoIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Task List</TooltipContent>
        </Tooltip>
      )}
    </ToolbarGroup>
  );
}
