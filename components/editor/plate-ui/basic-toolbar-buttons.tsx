"use client";

import {
  BoldIcon,
  CodeIcon,
  EyeIcon,
  Heading1,
  Heading2,
  HighlighterIcon,
  ItalicIcon,
  List,
  ListOrdered,
  PencilIcon,
  QuoteIcon,
  SeparatorHorizontal,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import { useEditorReadOnly, useEditorRef, usePlateState } from "platejs/react";
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

// Mode toggle button for switching between editing and viewing
function ModeToggleButton() {
  const [readOnly, setReadOnly] = usePlateState("readOnly");

  return (
    <ToolbarButton
      onClick={() => setReadOnly(!readOnly)}
      pressed={!readOnly}
      tooltip={readOnly ? "Edit mode" : "View mode"}
    >
      {readOnly ? <PencilIcon /> : <EyeIcon />}
    </ToolbarButton>
  );
}

// Full toolbar buttons component for basic variant
export function ToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      {!readOnly && (
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
      )}

      <div className="grow" />

      <ToolbarGroup>
        <ModeToggleButton />
      </ToolbarGroup>
    </>
  );
}
