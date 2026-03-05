"use client";

import type { Editor } from "@tiptap/react";
import { LinkIcon, UnlinkIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverClose,
  PopoverPopup,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { ToolbarGroup } from "@/components/ui/toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LinkPopoverProps {
  editor: Editor;
}

export function LinkPopover({ editor }: LinkPopoverProps) {
  const [url, setUrl] = useState("");
  const isActive = editor.isActive("link");

  const handleOpen = useCallback(() => {
    const existingUrl = editor.getAttributes("link").href ?? "";
    setUrl(existingUrl);
  }, [editor]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!url.trim()) {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }

      const href = url.trim();
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: "link",
          marks: [{ type: "link", attrs: { href } }],
        })
        .run();
      setUrl("");
    },
    [editor, url]
  );

  const handleUnlink = useCallback(() => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  }, [editor]);

  return (
    <ToolbarGroup>
      <Popover onOpenChange={(open) => open && handleOpen()}>
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={<Toggle pressed={isActive} size="sm" />}
              />
            }
          >
            <LinkIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Insert Link</TooltipContent>
        </Tooltip>
        <PopoverPopup align="start" side="bottom" sideOffset={8}>
          <form className="flex items-center gap-2" onSubmit={handleSubmit}>
            <Input
              className="h-8 w-56 text-xs"
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              value={url}
            />
            <PopoverClose render={<Button size="sm" type="submit" />}>
              Apply
            </PopoverClose>
          </form>
        </PopoverPopup>
      </Popover>

      {isActive && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onMouseDown={(event) => event.preventDefault()}
                onPressedChange={handleUnlink}
                pressed={false}
                size="sm"
              />
            }
          >
            <UnlinkIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Remove Link</TooltipContent>
        </Tooltip>
      )}
    </ToolbarGroup>
  );
}
