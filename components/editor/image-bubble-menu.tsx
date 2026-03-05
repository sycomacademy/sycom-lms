"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  FlipHorizontal2Icon,
  FlipVertical2Icon,
  Trash2Icon,
} from "lucide-react";
import { useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/packages/utils/cn";

interface ImageBubbleMenuProps {
  editor: Editor;
}

const sizes = [
  { label: "S", width: "25%" },
  { label: "M", width: "50%" },
  { label: "L", width: "100%" },
] as const;

export function ImageBubbleMenu({ editor }: ImageBubbleMenuProps) {
  const setSize = useCallback(
    (width: string) => {
      editor.chain().focus().updateAttributes("image", { width }).run();
    },
    [editor]
  );

  const setAlign = useCallback(
    (align: string) => {
      editor.chain().focus().updateAttributes("image", { align }).run();
    },
    [editor]
  );

  const deleteImage = useCallback(() => {
    editor.chain().focus().deleteSelection().run();
  }, [editor]);

  const toggleFlipX = useCallback(() => {
    const currentFlipX = Boolean(editor.getAttributes("image").flipX);
    editor
      .chain()
      .focus()
      .updateAttributes("image", { flipX: !currentFlipX })
      .run();
  }, [editor]);

  const toggleFlipY = useCallback(() => {
    const currentFlipY = Boolean(editor.getAttributes("image").flipY);
    editor
      .chain()
      .focus()
      .updateAttributes("image", { flipY: !currentFlipY })
      .run();
  }, [editor]);

  const currentWidth =
    (editor.getAttributes("image").width as string) ?? "100%";
  const currentAlign =
    (editor.getAttributes("image").align as string) ?? "center";
  const currentFlipX = Boolean(editor.getAttributes("image").flipX);
  const currentFlipY = Boolean(editor.getAttributes("image").flipY);

  return (
    <BubbleMenu
      className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg"
      editor={editor}
      shouldShow={({ editor: e }) => e.isActive("image")}
    >
      <TooltipProvider>
        {sizes.map((s) => (
          <Tooltip key={s.label}>
            <TooltipTrigger
              render={
                <Toggle
                  className={cn("font-semibold text-xs")}
                  onClick={() => setSize(s.width)}
                  onMouseDown={(event) => event.preventDefault()}
                  pressed={currentWidth === s.width}
                  size="sm"
                />
              }
            >
              {s.label}
            </TooltipTrigger>
            <TooltipContent>{s.width} width</TooltipContent>
          </Tooltip>
        ))}

        <Separator className="mx-0.5 h-5" orientation="vertical" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onClick={() => setAlign("left")}
                onMouseDown={(event) => event.preventDefault()}
                pressed={currentAlign === "left"}
                size="sm"
              />
            }
          >
            <AlignLeftIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Align Left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onClick={() => setAlign("center")}
                onMouseDown={(event) => event.preventDefault()}
                pressed={currentAlign === "center"}
                size="sm"
              />
            }
          >
            <AlignCenterIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Align Center</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onClick={() => setAlign("right")}
                onMouseDown={(event) => event.preventDefault()}
                pressed={currentAlign === "right"}
                size="sm"
              />
            }
          >
            <AlignRightIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Align Right</TooltipContent>
        </Tooltip>

        <Separator className="mx-0.5 h-5" orientation="vertical" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onClick={toggleFlipX}
                onMouseDown={(event) => event.preventDefault()}
                pressed={currentFlipX}
                size="sm"
              />
            }
          >
            <FlipHorizontal2Icon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Flip Horizontal</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onClick={toggleFlipY}
                onMouseDown={(event) => event.preventDefault()}
                pressed={currentFlipY}
                size="sm"
              />
            }
          >
            <FlipVertical2Icon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Flip Vertical</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                onClick={deleteImage}
                onMouseDown={(event) => event.preventDefault()}
                size="sm"
              />
            }
          >
            <Trash2Icon className="size-4 text-destructive" />
          </TooltipTrigger>
          <TooltipContent>Delete Image</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </BubbleMenu>
  );
}
