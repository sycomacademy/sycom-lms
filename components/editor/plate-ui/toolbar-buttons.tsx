"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import {
  BoldIcon,
  CodeIcon,
  Heading1,
  Heading2,
  HighlighterIcon,
  ItalicIcon,
  List,
  ListOrdered,
  QuoteIcon,
  Redo2Icon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react";
import {
  useEditorRef,
  useMarkToolbarButton,
  useMarkToolbarButtonState,
} from "platejs/react";
import type * as React from "react";
import { ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/packages/utils/cn";

// Base toolbar button with consistent styling
interface ToolbarButtonProps
  extends React.ComponentProps<typeof ToolbarPrimitive.Button> {
  tooltip?: string;
  pressed?: boolean;
}

function ToolbarButton({
  className,
  children,
  tooltip,
  pressed,
  ...props
}: ToolbarButtonProps) {
  const buttonElement = (
    <ToolbarPrimitive.Button
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs outline-none transition-all",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-pressed:bg-muted aria-pressed:text-foreground",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="toolbar-button"
      render={
        pressed !== undefined ? (
          <TogglePrimitive pressed={pressed} />
        ) : undefined
      }
      {...props}
    >
      {children}
    </ToolbarPrimitive.Button>
  );

  if (!tooltip) {
    return buttonElement;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={buttonElement} />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

// Mark button (bold, italic, etc.)
interface MarkButtonProps extends Omit<ToolbarButtonProps, "pressed"> {
  nodeType: string;
  clear?: string[] | string;
}

function MarkButton({ clear, nodeType, children, ...props }: MarkButtonProps) {
  const state = useMarkToolbarButtonState({ clear, nodeType });
  const { props: buttonProps } = useMarkToolbarButton(state);

  return (
    <ToolbarButton {...props} {...buttonProps} pressed={state.pressed}>
      {children}
    </ToolbarButton>
  );
}

// History buttons
function UndoButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      disabled={editor.history.undos.length === 0}
      onClick={() => editor.undo()}
      tooltip="Undo (Ctrl+Z)"
    >
      <Undo2Icon />
    </ToolbarButton>
  );
}

function RedoButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      disabled={editor.history.redos.length === 0}
      onClick={() => editor.redo()}
      tooltip="Redo (Ctrl+Y)"
    >
      <Redo2Icon />
    </ToolbarButton>
  );
}

// List buttons - using indent list via setNodes
function BulletListButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.setNodes({
          listStyleType: "disc",
          indent: 1,
        });
        editor.tf.focus();
      }}
      tooltip="Bullet List"
    >
      <List />
    </ToolbarButton>
  );
}

function NumberedListButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.setNodes({
          listStyleType: "decimal",
          indent: 1,
        });
        editor.tf.focus();
      }}
      tooltip="Numbered List"
    >
      <ListOrdered />
    </ToolbarButton>
  );
}

// Heading buttons
function Heading1Button() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.toggleBlock("h1");
        editor.tf.focus();
      }}
      tooltip="Heading 1"
    >
      <Heading1 />
    </ToolbarButton>
  );
}

function Heading2Button() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.toggleBlock("h2");
        editor.tf.focus();
      }}
      tooltip="Heading 2"
    >
      <Heading2 />
    </ToolbarButton>
  );
}

// Blockquote button
function BlockquoteButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.toggleBlock("blockquote");
        editor.tf.focus();
      }}
      tooltip="Quote"
    >
      <QuoteIcon />
    </ToolbarButton>
  );
}

// Full toolbar buttons component for course variant
export function ToolbarButtons() {
  return (
    <>
      <ToolbarGroup>
        <UndoButton />
        <RedoButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton nodeType="bold" tooltip="Bold">
          <BoldIcon />
        </MarkButton>
        <MarkButton nodeType="italic" tooltip="Italic">
          <ItalicIcon />
        </MarkButton>
        <MarkButton nodeType="underline" tooltip="Underline">
          <UnderlineIcon />
        </MarkButton>
        <MarkButton nodeType="strikethrough" tooltip="Strikethrough">
          <StrikethroughIcon />
        </MarkButton>
        <MarkButton nodeType="code" tooltip="Inline Code">
          <CodeIcon />
        </MarkButton>
        <MarkButton nodeType="highlight" tooltip="Highlight">
          <HighlighterIcon />
        </MarkButton>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <Heading1Button />
        <Heading2Button />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <BulletListButton />
        <NumberedListButton />
        <BlockquoteButton />
      </ToolbarGroup>
    </>
  );
}

// Minimal toolbar for basic variant
export function ToolbarButtonsBasic() {
  return (
    <>
      <ToolbarGroup>
        <MarkButton nodeType="bold" tooltip="Bold (Ctrl+B)">
          <BoldIcon />
        </MarkButton>
        <MarkButton nodeType="italic" tooltip="Italic (Ctrl+I)">
          <ItalicIcon />
        </MarkButton>
        <MarkButton nodeType="underline" tooltip="Underline (Ctrl+U)">
          <UnderlineIcon />
        </MarkButton>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <BulletListButton />
        <NumberedListButton />
      </ToolbarGroup>
    </>
  );
}
