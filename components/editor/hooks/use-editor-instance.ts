"use client";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";
import type { Content, JSONContent } from "@tiptap/react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { useEffect, useRef } from "react";
import { AudioPlayer } from "@/components/editor/extensions/audio-player/audio-player";
import { FileAttachment } from "@/components/editor/extensions/file-attachment/file-attachment";
import { QuizBlock } from "@/components/editor/extensions/quiz-block/quiz-block";
import { SlashCommand } from "@/components/editor/extensions/slash-command/slash-command";
import { VideoPlayer } from "@/components/editor/extensions/video-player/video-player";
import type { EditorVariant } from "@/components/editor/types";

const lowlight = createLowlight(common);

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) => {
          const styleWidth = element.style.width;
          const dataWidth = element.getAttribute("data-width");
          const attrWidth = element.getAttribute("width");
          return styleWidth || dataWidth || attrWidth || "100%";
        },
        renderHTML: (attributes) => ({
          style: `width: ${attributes.width};`,
          "data-width": attributes.width,
        }),
      },
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") ?? "center",
        renderHTML: (attributes) => ({
          "data-align": attributes.align,
        }),
      },
      flipX: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-flip-x") === "true",
        renderHTML: (attributes) => ({
          "data-flip-x": String(Boolean(attributes.flipX)),
        }),
      },
      flipY: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-flip-y") === "true",
        renderHTML: (attributes) => ({
          "data-flip-y": String(Boolean(attributes.flipY)),
        }),
      },
    };
  },
});

function getExtensions(variant: EditorVariant, placeholder?: string) {
  const base = [
    StarterKit.configure({
      codeBlock: false,
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    }),
    Placeholder.configure({
      placeholder: placeholder ?? "",
      showOnlyWhenEditable: true,
      showOnlyCurrent: false,
      emptyEditorClass: "is-editor-empty",
    }),
  ];

  if (variant === "bare") {
    return base;
  }

  const basicExtensions = [
    ...base,
    TaskList,
    TaskItem.configure({ nested: true }),
    Typography,
  ];

  if (variant === "basic") {
    return basicExtensions;
  }

  return [
    ...basicExtensions,
    ResizableImage.configure({ inline: false, allowBase64: true }),
    Youtube.configure({ inline: false, ccLanguage: "en" }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Superscript,
    Subscript,
    CodeBlockLowlight.configure({ lowlight }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    VideoPlayer,
    AudioPlayer,
    FileAttachment,
    QuizBlock,
    SlashCommand,
  ];
}

interface UseEditorInstanceOptions {
  variant: EditorVariant;
  content?: Content;
  editable?: boolean;
  placeholder?: string;
  autofocus?: boolean;
  onUpdate?: (content: JSONContent) => void;
  onBlur?: (content: JSONContent) => void;
}

export function useEditorInstance({
  variant,
  content,
  editable = true,
  placeholder,
  autofocus = false,
  onUpdate,
  onBlur,
}: UseEditorInstanceOptions) {
  const onUpdateRef = useRef(onUpdate);
  const onBlurRef = useRef(onBlur);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    onBlurRef.current = onBlur;
  }, [onBlur]);

  const editor = useEditor({
    extensions: getExtensions(variant, placeholder),
    content: content ?? undefined,
    editable,
    autofocus,
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
    onUpdate: ({ editor: e }) => {
      onUpdateRef.current?.(e.getJSON());
    },
    onBlur: ({ editor: e }) => {
      onBlurRef.current?.(e.getJSON());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  return editor;
}
