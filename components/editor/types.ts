import type { Content, Editor, JSONContent } from "@tiptap/react";
import type { StorageEntityType } from "@/packages/db/schema/storage";

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
  /** When set, editor media uploads go to Cloudinary. Otherwise base64 embed. */
  mediaUploadOwnerId?: string;
  mediaUploadEntityType?: StorageEntityType;
}

export interface ToolbarProps {
  editor: Editor;
  variant: EditorVariant;
  mediaUploadOwnerId?: string;
  mediaUploadEntityType?: StorageEntityType;
}
