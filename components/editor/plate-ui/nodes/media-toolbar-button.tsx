"use client";

import { PlaceholderPlugin } from "@platejs/media/react";
import {
  AudioLinesIcon,
  FileUpIcon,
  FilmIcon,
  ImageIcon,
  LinkIcon,
} from "lucide-react";
import { isUrl, KEYS } from "platejs";
import { useEditorRef } from "platejs/react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useFilePicker } from "use-file-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useFileUploadSimple } from "@/packages/hooks/use-file-upload";
import {
  ToolbarSplitButton,
  ToolbarSplitButtonPrimary,
  ToolbarSplitButtonSecondary,
} from "./toolbar";

const MEDIA_CONFIG: Record<
  string,
  {
    accept: string[];
    icon: React.ReactNode;
    title: string;
    tooltip: string;
  }
> = {
  [KEYS.audio]: {
    accept: ["audio/*"],
    icon: <AudioLinesIcon className="size-4" />,
    title: "Insert Audio",
    tooltip: "Audio",
  },
  [KEYS.file]: {
    accept: ["*"],
    icon: <FileUpIcon className="size-4" />,
    title: "Insert File",
    tooltip: "File",
  },
  [KEYS.img]: {
    accept: ["image/*"],
    icon: <ImageIcon className="size-4" />,
    title: "Insert Image",
    tooltip: "Image",
  },
  [KEYS.video]: {
    accept: ["video/*"],
    icon: <FilmIcon className="size-4" />,
    title: "Insert Video",
    tooltip: "Video",
  },
};

export function MediaToolbarButton({
  nodeType,
  uploadEntityType,
  uploadEntityId,
  ...props
}: React.ComponentProps<typeof DropdownMenu> & {
  nodeType: string;
  uploadEntityType?: string;
  uploadEntityId?: string;
}) {
  const currentConfig = MEDIA_CONFIG[nodeType];

  const editor = useEditorRef();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { upload, isPending } = useFileUploadSimple();

  const getCategoryForNodeType = (type: string) => {
    if (type === KEYS.img) {
      return "image" as const;
    }
    if (type === KEYS.video) {
      return "video" as const;
    }
    return "attachment" as const;
  };

  const insertMediaNode = (
    type: string,
    url: string,
    name?: string,
    contentType?: string
  ) => {
    const resolvedName = name ?? url.split("/").pop() ?? "file";

    editor.tf.insertNodes({
      children: [{ text: "" }],
      name: type === KEYS.file ? resolvedName : undefined,
      type,
      url,
      ...(type === KEYS.video
        ? {
            isUpload: true,
          }
        : {}),
      ...(type === KEYS.audio || type === KEYS.file
        ? {
            mediaType:
              contentType ?? (type === KEYS.audio ? "audio/mpeg" : undefined),
          }
        : {}),
    });
    editor.tf.focus();
  };

  const uploadAndInsertFiles = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    if (!(uploadEntityType && uploadEntityId)) {
      const dataTransfer = new DataTransfer();
      for (const file of files) {
        dataTransfer.items.add(file);
      }
      editor.getTransforms(PlaceholderPlugin).insert.media(dataTransfer.files);
      return;
    }

    const category = getCategoryForNodeType(nodeType);

    for (const file of files) {
      try {
        const uploadedFile = await upload(file, {
          category,
          entityId: uploadEntityId,
          entityType: uploadEntityType,
          visibility: "public",
        });

        insertMediaNode(
          nodeType,
          uploadedFile.url,
          uploadedFile.filename,
          uploadedFile.contentType
        );
      } catch {
        return;
      }
    }
  };

  const { openFilePicker } = useFilePicker({
    accept: currentConfig.accept,
    multiple: true,
    onFilesSelected: ({ plainFiles: updatedFiles }) => {
      void uploadAndInsertFiles(updatedFiles);
    },
  });

  return (
    <>
      <ToolbarSplitButton pressed={open}>
        <ToolbarSplitButtonPrimary
          onClick={() => {
            openFilePicker();
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        >
          {currentConfig.icon}
        </ToolbarSplitButtonPrimary>

        <DropdownMenu
          modal={false}
          onOpenChange={setOpen}
          open={open}
          {...props}
        >
          <DropdownMenuTrigger
            render={
              <ToolbarSplitButtonSecondary
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
              />
            }
          />

          <DropdownMenuContent
            align="start"
            alignOffset={-32}
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => openFilePicker()}>
                {currentConfig.icon}
                Upload from computer
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTimeout(() => setDialogOpen(true), 0)}>
                <LinkIcon />
                Insert via URL
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ToolbarSplitButton>

      <AlertDialog
        onOpenChange={(value) => {
          setDialogOpen(value);
        }}
        open={dialogOpen}
      >
        <AlertDialogContent className="gap-6">
          <MediaUrlDialogContent
            currentConfig={currentConfig}
            insertMediaNode={insertMediaNode}
            isPending={isPending}
            nodeType={nodeType}
            setOpen={setDialogOpen}
          />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function MediaUrlDialogContent({
  currentConfig,
  insertMediaNode,
  isPending,
  nodeType,
  setOpen,
}: {
  currentConfig: (typeof MEDIA_CONFIG)[string];
  isPending: boolean;
  insertMediaNode: (
    type: string,
    url: string,
    name?: string,
    contentType?: string
  ) => void;
  nodeType: string;
  setOpen: (value: boolean) => void;
}) {
  const [url, setUrl] = React.useState("");

  const embedMedia = React.useCallback(() => {
    if (!isUrl(url)) {
      return toast.error("Invalid URL");
    }

    setOpen(false);
    insertMediaNode(nodeType, url, url.split("/").pop());
  }, [url, nodeType, setOpen, insertMediaNode]);

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{currentConfig.title}</AlertDialogTitle>
      </AlertDialogHeader>

      <AlertDialogDescription className="group relative w-full">
        <label className="mb-1 block font-medium text-sm" htmlFor="url">
          URL
        </label>
        <Input
          autoFocus
          className="w-full"
          disabled={isPending}
          id="url"
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              embedMedia();
            }
          }}
          placeholder="https://example.com/file"
          type="url"
          value={url}
        />
      </AlertDialogDescription>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          disabled={isPending}
          onClick={(e) => {
            e.preventDefault();
            embedMedia();
          }}
        >
          Accept
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}
