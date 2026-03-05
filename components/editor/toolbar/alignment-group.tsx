"use client";

import type { Editor } from "@tiptap/react";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ToolbarGroup } from "@/components/ui/toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AlignmentGroupProps {
  editor: Editor;
}

const alignments = [
  { label: "Align Left", value: "left", icon: AlignLeftIcon },
  { label: "Align Center", value: "center", icon: AlignCenterIcon },
  { label: "Align Right", value: "right", icon: AlignRightIcon },
  { label: "Justify", value: "justify", icon: AlignJustifyIcon },
] as const;

export function AlignmentGroup({ editor }: AlignmentGroupProps) {
  return (
    <ToolbarGroup>
      {alignments.map((a) => (
        <Tooltip key={a.value}>
          <TooltipTrigger
            render={
              <Toggle
                onPressedChange={() =>
                  editor.chain().focus().setTextAlign(a.value).run()
                }
                pressed={editor.isActive({ textAlign: a.value })}
                size="sm"
              />
            }
          >
            <a.icon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>{a.label}</TooltipContent>
        </Tooltip>
      ))}
    </ToolbarGroup>
  );
}
