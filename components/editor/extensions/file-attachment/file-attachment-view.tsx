"use client";

import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { DownloadIcon, FileIcon } from "lucide-react";
import { useCallback } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/packages/utils/cn";

const DATA_URL_BASE64_REGEX = /^data:([^;]+);base64$/;

function dataUrlToBlob(dataUrl: string): Blob {
  const [metadata, encodedData] = dataUrl.split(",");
  const mimeMatch = metadata.match(DATA_URL_BASE64_REGEX);

  if (!(mimeMatch && encodedData)) {
    throw new Error("Invalid data URL");
  }

  const binary = window.atob(encodedData);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeMatch[1] });
}

export function FileAttachmentView({ node, selected }: NodeViewProps) {
  const { href, fileName, fileSize, mimeType } = node.attrs as {
    href: string;
    fileName: string;
    fileSize?: string;
    mimeType?: string;
  };

  const handleDownload = useCallback(async () => {
    try {
      const blob = href.startsWith("data:")
        ? dataUrlToBlob(href)
        : await fetch(href).then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch file");
            }
            return response.blob();
          });

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  }, [fileName, href]);

  return (
    <NodeViewWrapper
      className={cn(
        "my-3 rounded-md border border-border bg-card p-3",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      data-type="file-attachment"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileIcon className="size-4 text-muted-foreground" />
            <p className="truncate font-medium text-sm">{fileName}</p>
          </div>
          <p className="truncate text-muted-foreground text-xs">
            {[fileSize, mimeType].filter(Boolean).join(" • ") || "Attachment"}
          </p>
        </div>
        <button
          className={cn(buttonVariants({ size: "xs", variant: "outline" }))}
          onClick={handleDownload}
          type="button"
        >
          <DownloadIcon className="size-3.5" />
          Download
        </button>
      </div>
    </NodeViewWrapper>
  );
}
