"use client";

import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CheckSquareIcon,
  CodeIcon,
  EyeIcon,
  Heading1,
  Heading2,
  Heading3,
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
import { KEYS } from "platejs";
import { useEditorReadOnly, useEditorRef, usePlateState } from "platejs/react";
import { ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar";
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from "./history-toolbar-buttons";
import { MarkToolbarButton } from "./mark-toolbar-button";
import { LinkToolbarButton } from "./nodes/link-toolbar-button";
import { MediaToolbarButton } from "./nodes/media-toolbar-button";
import { TableToolbarButton } from "./nodes/table-toolbar-button";
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

function TodoListButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.setNodes({
          listStyleType: "todo",
          indent: 1,
          checked: false,
        });
        editor.tf.focus();
      }}
      tooltip="To-do List"
    >
      <CheckSquareIcon />
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

function Heading3Button() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.toggleBlock("h3");
        editor.tf.focus();
      }}
      tooltip="Heading 3"
    >
      <Heading3 />
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

// Align buttons
function AlignLeftButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.setNodes({ align: "left" });
        editor.tf.focus();
      }}
      tooltip="Align Left"
    >
      <AlignLeftIcon />
    </ToolbarButton>
  );
}

function AlignCenterButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.setNodes({ align: "center" });
        editor.tf.focus();
      }}
      tooltip="Align Center"
    >
      <AlignCenterIcon />
    </ToolbarButton>
  );
}

function AlignRightButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.setNodes({ align: "right" });
        editor.tf.focus();
      }}
      tooltip="Align Right"
    >
      <AlignRightIcon />
    </ToolbarButton>
  );
}

function AlignJustifyButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.setNodes({ align: "justify" });
        editor.tf.focus();
      }}
      tooltip="Justify"
    >
      <AlignJustifyIcon />
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

// Full toolbar buttons component for course variant
interface CourseToolbarButtonsProps {
  uploadEntityType?: string;
  uploadEntityId?: string;
}

export function CourseToolbarButtons({
  uploadEntityType,
  uploadEntityId,
}: CourseToolbarButtonsProps) {
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
            <MarkToolbarButton nodeType="code" tooltip="Code">
              <CodeIcon />
            </MarkToolbarButton>
            <MarkToolbarButton nodeType="highlight" tooltip="Highlight">
              <HighlighterIcon />
            </MarkToolbarButton>
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <Heading1Button />
            <Heading2Button />
            <Heading3Button />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <BulletListButton />
            <NumberedListButton />
            <TodoListButton />
            <BlockquoteButton />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <AlignLeftButton />
            <AlignCenterButton />
            <AlignRightButton />
            <AlignJustifyButton />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <LinkToolbarButton />
            <TableToolbarButton />
            <HorizontalRuleButton />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <MediaToolbarButton
              nodeType={KEYS.img}
              uploadEntityId={uploadEntityId}
              uploadEntityType={uploadEntityType}
            />
            <MediaToolbarButton
              nodeType={KEYS.video}
              uploadEntityId={uploadEntityId}
              uploadEntityType={uploadEntityType}
            />
            <MediaToolbarButton
              nodeType={KEYS.audio}
              uploadEntityId={uploadEntityId}
              uploadEntityType={uploadEntityType}
            />
            <MediaToolbarButton
              nodeType={KEYS.file}
              uploadEntityId={uploadEntityId}
              uploadEntityType={uploadEntityType}
            />
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
