"use client";

import type { Editor } from "@tiptap/react";
import {
  ChevronDownIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  PilcrowIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToolbarGroup } from "@/components/ui/toolbar";

interface HeadingGroupProps {
  editor: Editor;
}

const headingItems = [
  {
    label: "Paragraph",
    icon: PilcrowIcon,
    action: (editor: Editor) => editor.chain().focus().setParagraph().run(),
    isActive: (editor: Editor) =>
      editor.isActive("paragraph") && !editor.isActive("heading"),
  },
  {
    label: "Heading 1",
    icon: Heading1Icon,
    action: (editor: Editor) =>
      editor.chain().focus().setHeading({ level: 1 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    label: "Heading 2",
    icon: Heading2Icon,
    action: (editor: Editor) =>
      editor.chain().focus().setHeading({ level: 2 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    label: "Heading 3",
    icon: Heading3Icon,
    action: (editor: Editor) =>
      editor.chain().focus().setHeading({ level: 3 }).run(),
    isActive: (editor: Editor) => editor.isActive("heading", { level: 3 }),
  },
] as const;

function getActiveLabel(editor: Editor) {
  for (const item of headingItems) {
    if (item.isActive(editor)) {
      return item.label;
    }
  }
  return "Paragraph";
}

export function HeadingGroup({ editor }: HeadingGroupProps) {
  const activeLabel = getActiveLabel(editor);

  return (
    <ToolbarGroup>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" variant="ghost" />}>
          <span className="min-w-16 text-left text-xs">{activeLabel}</span>
          <ChevronDownIcon className="size-3.5 opacity-50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={8}>
          {headingItems.map((item) => (
            <DropdownMenuItem
              className={item.isActive(editor) ? "bg-muted font-semibold" : ""}
              key={item.label}
              onClick={() => item.action(editor)}
              onMouseDown={(event) => event.preventDefault()}
            >
              <item.icon className="mr-2 size-4" />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </ToolbarGroup>
  );
}
