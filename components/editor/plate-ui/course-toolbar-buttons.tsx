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
  FileIcon,
  Heading1,
  Heading2,
  Heading3,
  HighlighterIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  List,
  ListOrdered,
  MusicIcon,
  PencilIcon,
  QuoteIcon,
  SeparatorHorizontal,
  StrikethroughIcon,
  TableIcon,
  UnderlineIcon,
  VideoIcon,
} from "lucide-react";
import { KEYS } from "platejs";
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

// Table button
function TableButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.insertNodes({
          type: "table",
          children: [
            {
              type: "tr",
              children: [
                {
                  type: "td",
                  children: [{ type: "p", children: [{ text: "" }] }],
                },
                {
                  type: "td",
                  children: [{ type: "p", children: [{ text: "" }] }],
                },
              ],
            },
            {
              type: "tr",
              children: [
                {
                  type: "td",
                  children: [{ type: "p", children: [{ text: "" }] }],
                },
                {
                  type: "td",
                  children: [{ type: "p", children: [{ text: "" }] }],
                },
              ],
            },
          ],
        });
        editor.tf.focus();
      }}
      tooltip="Insert Table"
    >
      <TableIcon />
    </ToolbarButton>
  );
}

// Link button - wraps selected text as a link
function LinkButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        // Wrap selection with a link (URL can be edited via floating toolbar)
        editor.tf.wrapNodes(
          {
            type: KEYS.link,
            url: "https://",
            children: [],
          },
          { split: true }
        );
        editor.tf.focus();
      }}
      tooltip="Insert Link"
    >
      <LinkIcon />
    </ToolbarButton>
  );
}

// Media buttons - insert placeholder media blocks
function ImageButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.insertNodes({
          type: KEYS.img,
          url: "",
          children: [{ text: "" }],
        });
        editor.tf.focus();
      }}
      tooltip="Insert Image"
    >
      <ImageIcon />
    </ToolbarButton>
  );
}

function VideoButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.insertNodes({
          type: KEYS.video,
          url: "",
          children: [{ text: "" }],
        });
        editor.tf.focus();
      }}
      tooltip="Insert Video"
    >
      <VideoIcon />
    </ToolbarButton>
  );
}

function AudioButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.insertNodes({
          type: KEYS.audio,
          url: "",
          children: [{ text: "" }],
        });
        editor.tf.focus();
      }}
      tooltip="Insert Audio"
    >
      <MusicIcon />
    </ToolbarButton>
  );
}

function FileButton() {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      onClick={() => {
        editor.tf.insertNodes({
          type: KEYS.file,
          url: "",
          name: "file",
          children: [{ text: "" }],
        });
        editor.tf.focus();
      }}
      tooltip="Insert File"
    >
      <FileIcon />
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
export function CourseToolbarButtons() {
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
            <LinkButton />
            <TableButton />
            <HorizontalRuleButton />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <ImageButton />
            <VideoButton />
            <AudioButton />
            <FileButton />
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
