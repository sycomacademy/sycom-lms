import type { Content, Editor, JSONContent } from "@tiptap/react";

export type EditorVariant = "bare" | "basic" | "full";

export interface EditorProps {
  variant?: EditorVariant;
  content?: Content;
  onUpdate?: (content: JSONContent) => void;
  onBlur?: (content: JSONContent) => void;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  autofocus?: boolean;
  /** When set, lesson media uploads go to Cloudinary. Otherwise base64 embed. */
  mediaUploadOwnerId?: string;
}

export interface ToolbarProps {
  editor: Editor;
  variant: EditorVariant;
  mediaUploadOwnerId?: string;
}
