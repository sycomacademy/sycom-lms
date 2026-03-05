"use client";

import type { Editor } from "@tiptap/react";
import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ToolbarGroup } from "@/components/ui/toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FormattingGroupProps {
  editor: Editor;
}

const items = [
  { label: "Bold", icon: BoldIcon, command: "toggleBold", active: "bold" },
  {
    label: "Italic",
    icon: ItalicIcon,
    command: "toggleItalic",
    active: "italic",
  },
  {
    label: "Underline",
    icon: UnderlineIcon,
    command: "toggleUnderline",
    active: "underline",
  },
  {
    label: "Strikethrough",
    icon: StrikethroughIcon,
    command: "toggleStrike",
    active: "strike",
  },
  {
    label: "Inline Code",
    icon: CodeIcon,
    command: "toggleCode",
    active: "code",
  },
] as const;

export function FormattingGroup({ editor }: FormattingGroupProps) {
  return (
    <ToolbarGroup>
      {items.map((item) => (
        <Tooltip key={item.active}>
          <TooltipTrigger
            render={
              <Toggle
                onMouseDown={(event) => event.preventDefault()}
                onPressedChange={() => {
                  editor.chain().focus()[item.command]().run();
                }}
                pressed={editor.isActive(item.active)}
                size="sm"
              />
            }
          >
            <item.icon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>{item.label}</TooltipContent>
        </Tooltip>
      ))}
    </ToolbarGroup>
  );
}
