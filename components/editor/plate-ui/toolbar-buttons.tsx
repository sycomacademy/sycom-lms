"use client";

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
  SeparatorHorizontal,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import { useEditorRef } from "platejs/react";
import { ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar";
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from "./history-toolbar-buttons";
import { MarkToolbarButton } from "./mark-toolbar-button";
import { ToolbarButton } from "./toolbar-button";

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

// Horizontal Rule button
function HorizontalRuleButton() {
  const editor = useEditorRef();
  return (
    <ToolbarButton
      onClick={() => editor.tf.toggleBlock("hr")}
      tooltip="Horizontal Rule"
    >
      <SeparatorHorizontal />
    </ToolbarButton>
  );
}

// Full toolbar buttons component for course variant
export function ToolbarButtons() {
  return (
    <>
      <ToolbarGroup>
        <UndoToolbarButton />
        <RedoToolbarButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkToolbarButton nodeType="bold" tooltip="Bold">
          <BoldIcon />
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="italic" tooltip="Italic">
          <ItalicIcon />
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="underline" tooltip="Underline">
          <UnderlineIcon />
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="strikethrough" tooltip="Strikethrough">
          <StrikethroughIcon />
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="code" tooltip="Inline Code">
          <CodeIcon />
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="highlight" tooltip="Highlight">
          <HighlighterIcon />
        </MarkToolbarButton>
        <HorizontalRuleButton />
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
