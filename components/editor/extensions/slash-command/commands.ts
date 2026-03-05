import type { Editor } from "@tiptap/react";
import type { LucideIcon } from "lucide-react";
import {
  CircleHelpIcon,
  CodeIcon,
  FileIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  MinusIcon,
  MusicIcon,
  PilcrowIcon,
  PlayIcon,
  QuoteIcon,
  TableIcon,
  VideoIcon,
} from "lucide-react";
import { openEditorUrlDialog } from "./url-dialog";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: LucideIcon;
  command: (editor: Editor) => void;
  category: string;
  aliases?: string[];
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }
      reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function createFileInput(
  accept: string,
  onSelect: (file: File) => void | Promise<void>
) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    await onSelect(file);
  };
  input.click();
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const textCommands: SlashCommandItem[] = [
  {
    title: "Paragraph",
    description: "Plain text block",
    icon: PilcrowIcon,
    category: "Text",
    command: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: Heading1Icon,
    category: "Text",
    aliases: ["h1"],
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: Heading2Icon,
    category: "Text",
    aliases: ["h2"],
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: Heading3Icon,
    category: "Text",
    aliases: ["h3"],
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
];

const listCommands: SlashCommandItem[] = [
  {
    title: "Bullet List",
    description: "Unordered list of items",
    icon: ListIcon,
    category: "Lists",
    aliases: ["ul"],
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Ordered List",
    description: "Numbered list of items",
    icon: ListOrderedIcon,
    category: "Lists",
    aliases: ["ol"],
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Task List",
    description: "Checklist with checkboxes",
    icon: ListTodoIcon,
    category: "Lists",
    aliases: ["todo", "checklist"],
    command: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
];

const blockCommands: SlashCommandItem[] = [
  {
    title: "Blockquote",
    description: "Quoted text block",
    icon: QuoteIcon,
    category: "Blocks",
    aliases: ["quote"],
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    description: "Syntax-highlighted code",
    icon: CodeIcon,
    category: "Blocks",
    aliases: ["code", "pre"],
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: "Divider",
    description: "Horizontal separator line",
    icon: MinusIcon,
    category: "Blocks",
    aliases: ["hr", "separator"],
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    title: "Table",
    description: "Insert a table",
    icon: TableIcon,
    category: "Blocks",
    command: (editor) =>
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
];

const mediaCommands: SlashCommandItem[] = [
  {
    title: "Image",
    description: "Upload an image",
    icon: ImageIcon,
    category: "Media",
    aliases: ["img", "picture"],
    command: (editor) => {
      createFileInput("image/*", async (file) => {
        const src = await fileToDataUrl(file);
        editor.chain().focus().setImage({ src }).run();
      });
    },
  },
  {
    title: "YouTube Video",
    description: "Embed a YouTube video",
    icon: VideoIcon,
    category: "Media",
    aliases: ["youtube", "embed"],
    command: (editor) => {
      openEditorUrlDialog({
        title: "Embed YouTube Video",
        placeholder: "https://www.youtube.com/watch?v=...",
        onSubmit: (value) => {
          editor.chain().focus().setYoutubeVideo({ src: value }).run();
        },
      });
    },
  },
  {
    title: "Video Player",
    description: "Upload a video with custom controls",
    icon: PlayIcon,
    category: "Media",
    aliases: ["video", "mp4"],
    command: (editor) => {
      createFileInput("video/*", async (file) => {
        const src = await fileToDataUrl(file);
        editor.chain().focus().setVideoPlayer({ src, title: file.name }).run();
      });
    },
  },
  {
    title: "Audio",
    description: "Upload an audio file",
    icon: MusicIcon,
    category: "Media",
    aliases: ["music", "mp3", "wav"],
    command: (editor) => {
      createFileInput("audio/*", async (file) => {
        const src = await fileToDataUrl(file);
        editor
          .chain()
          .focus()
          .setAudioPlayer({ src, title: file.name, mimeType: file.type })
          .run();
      });
    },
  },
  {
    title: "File",
    description: "Attach any file",
    icon: FileIcon,
    category: "Media",
    aliases: ["attachment", "document"],
    command: (editor) => {
      createFileInput("*/*", async (file) => {
        const href = await fileToDataUrl(file);
        editor
          .chain()
          .focus()
          .setFileAttachment({
            href,
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            mimeType: file.type || "application/octet-stream",
          })
          .run();
      });
    },
  },
];

const customBlockCommands: SlashCommandItem[] = [
  {
    title: "Quiz Block",
    description: "Multiple choice question",
    icon: CircleHelpIcon,
    category: "Custom",
    aliases: ["quiz", "question", "mcq"],
    command: (editor) => {
      editor
        .chain()
        .focus()
        .setQuizBlock({
          question: "Your question here?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctIndex: 0,
          correctIndexes: [0],
          allowMultiple: false,
        })
        .run();
    },
  },
];

export function getSlashCommands(): SlashCommandItem[] {
  return [
    ...textCommands,
    ...listCommands,
    ...blockCommands,
    ...mediaCommands,
    ...customBlockCommands,
  ];
}
