"use client";

import { NodeSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import {
  BoldIcon,
  CodeIcon,
  HighlighterIcon,
  ItalicIcon,
  LinkIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  Trash2Icon,
  UnderlineIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/packages/utils/cn";

interface EditorBubbleMenuProps {
  editor: Editor;
}

const markItems = [
  { icon: BoldIcon, command: "toggleBold", active: "bold" },
  { icon: ItalicIcon, command: "toggleItalic", active: "italic" },
  { icon: UnderlineIcon, command: "toggleUnderline", active: "underline" },
  { icon: StrikethroughIcon, command: "toggleStrike", active: "strike" },
  { icon: CodeIcon, command: "toggleCode", active: "code" },
  {
    icon: SuperscriptIcon,
    command: "toggleSuperscript",
    active: "superscript",
  },
  { icon: SubscriptIcon, command: "toggleSubscript", active: "subscript" },
] as const;

const DELETE_ONLY_NODE_TYPES = new Set([
  "fileAttachment",
  "videoPlayer",
  "audioPlayer",
  "quizBlock",
]);

function isDeleteOnlySelection(editor: Editor) {
  const { selection } = editor.state;

  if (selection instanceof NodeSelection) {
    return DELETE_ONLY_NODE_TYPES.has(selection.node.type.name);
  }

  return (
    editor.isActive("fileAttachment") ||
    editor.isActive("videoPlayer") ||
    editor.isActive("audioPlayer") ||
    editor.isActive("quizBlock")
  );
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const handleLinkSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (linkUrl.trim()) {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: linkUrl.trim() })
          .run();
      } else {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      }
      setShowLinkInput(false);
      setLinkUrl("");
    },
    [editor, linkUrl]
  );

  const openLinkInput = useCallback(() => {
    const existingHref = editor.getAttributes("link").href ?? "";
    setLinkUrl(existingHref);
    setShowLinkInput(true);
  }, [editor]);

  const isDeleteOnlyNodeSelection = isDeleteOnlySelection(editor);

  const handleDeleteNode = useCallback(() => {
    editor.chain().focus().deleteSelection().run();
  }, [editor]);

  let menuContent: React.ReactNode;

  if (showLinkInput) {
    menuContent = (
      <form className="flex items-center gap-1" onSubmit={handleLinkSubmit}>
        <Input
          autoFocus
          className="h-7 w-44 text-xs"
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowLinkInput(false);
              setLinkUrl("");
            }
          }}
          placeholder="https://..."
          value={linkUrl}
        />
        <Button size="sm" type="submit">
          OK
        </Button>
      </form>
    );
  } else if (isDeleteOnlyNodeSelection) {
    menuContent = (
      <Toggle
        onMouseDown={(event) => event.preventDefault()}
        onPressedChange={handleDeleteNode}
        size="sm"
      >
        <Trash2Icon className="size-3.5 text-destructive" />
      </Toggle>
    );
  } else {
    menuContent = (
      <>
        {markItems.map((item) => (
          <Toggle
            key={item.active}
            onMouseDown={(event) => event.preventDefault()}
            onPressedChange={() => {
              editor.chain().focus()[item.command]().run();
            }}
            pressed={editor.isActive(item.active)}
            size="sm"
          >
            <item.icon className="size-3.5" />
          </Toggle>
        ))}

        <Toggle
          onMouseDown={(event) => event.preventDefault()}
          onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
          pressed={editor.isActive("highlight")}
          size="sm"
        >
          <HighlighterIcon className="size-3.5" />
        </Toggle>

        <Toggle
          onMouseDown={(event) => event.preventDefault()}
          onPressedChange={openLinkInput}
          pressed={editor.isActive("link")}
          size="sm"
        >
          <LinkIcon className="size-3.5" />
        </Toggle>
      </>
    );
  }

  return (
    <TiptapBubbleMenu
      className={cn(
        "flex items-center gap-0.5 rounded-md border border-border bg-popover p-1 shadow-lg"
      )}
      editor={editor}
      shouldShow={({ editor: e }) => {
        if (showLinkInput) {
          return true;
        }

        if (isDeleteOnlySelection(e)) {
          return true;
        }

        if (e.state.selection.empty) {
          return false;
        }

        if (e.isActive("image") || e.isActive("table")) {
          return false;
        }

        return true;
      }}
    >
      {menuContent}
    </TiptapBubbleMenu>
  );
}
