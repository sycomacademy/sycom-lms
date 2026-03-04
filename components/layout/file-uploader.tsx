"use client";

import { FileTextIcon } from "lucide-react";
import Image from "next/image";
import type { HTMLAttributes } from "react";
import { useCallback, useEffect } from "react";
import Dropzone, {
  type DropzoneProps,
  type FileRejection,
} from "react-dropzone";
import { UploadIcon } from "@/components/icons/animated/upload";
import { XIcon } from "@/components/icons/animated/x";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toastManager } from "@/components/ui/toast";
import { useControllableState } from "@/packages/hooks/use-controllable-state";
import { cn } from "@/packages/utils/cn";
import { formatBytes } from "@/packages/utils/file";

interface FileUploaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Value of the uploader.
   */
  value?: File[];
  /**
   * Function to be called when the value changes.
   */
  onValueChange?: (files: File[]) => void;
  /**
   * Function to be called when files are uploaded.
   */
  onUpload?: (files: File[]) => Promise<void>;
  /**
   * Progress of the uploaded files.
   */
  progresses?: Record<string, number>;
  /**
   * Accepted file types for the uploader.
   */
  accept?: DropzoneProps["accept"];
  /**
   * Maximum file size for the uploader (default: 2MB).
   */
  maxSize?: DropzoneProps["maxSize"];
  /**
   * Maximum number of files for the uploader.
   */
  maxFileCount?: DropzoneProps["maxFiles"];
  /**
   * Whether the uploader should accept multiple files.
   */
  multiple?: boolean;
  /**
   * Whether the uploader is disabled.
   */
  disabled?: boolean;
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    progresses,
    accept = {
      "image/*": [],
    },
    maxSize = 1024 * 1024 * 2,
    maxFileCount = 1,
    multiple = false,
    disabled = false,
    className,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState({
    prop: valueProp,
    onChange: onValueChange,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFileCount === 1 && acceptedFiles.length > 1) {
        toastManager.add({
          title: "Cannot upload more than 1 file at a time",
          type: "error",
        });
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFileCount) {
        toastManager.add({
          title: `Cannot upload more than ${maxFileCount} files`,
          type: "error",
        });
        return;
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      const updatedFiles = files ? [...files, ...newFiles] : newFiles;

      setFiles(updatedFiles);

      if (rejectedFiles.length > 0) {
        for (const { file, errors } of rejectedFiles) {
          toastManager.add({
            title: `File ${file.name} was rejected`,
            description: errors[0].code,
            type: "error",
          });
        }
      }

      if (
        onUpload &&
        updatedFiles.length > 0 &&
        updatedFiles.length <= maxFileCount
      ) {
        const target =
          updatedFiles.length > 1
            ? `${updatedFiles.length} files`
            : updatedFiles[0].name;

        toastManager.promise(
          onUpload(updatedFiles).then(() => {
            setFiles([]);
          }),
          {
            loading: `Uploading ${target}...`,
            success: `${target} uploaded`,
            error: `Failed to upload ${target}`,
          }
        );
      }
    },
    [files, maxFileCount, multiple, onUpload, setFiles]
  );

  function onRemove(index: number) {
    if (!files) {
      return;
    }
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onValueChange?.(newFiles);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to revoke the preview url when the component unmounts
  useEffect(() => {
    return () => {
      if (!files) {
        return;
      }
      for (const file of files) {
        if (isFileWithPreview(file)) {
          URL.revokeObjectURL(file.preview);
        }
      }
    };
  }, []);

  const isDisabled = disabled || (files?.length ?? 0) >= maxFileCount;

  return (
    <div className="relative flex flex-col gap-4 overflow-hidden">
      <Dropzone
        accept={accept}
        disabled={isDisabled}
        maxFiles={maxFileCount}
        maxSize={maxSize}
        multiple={maxFileCount > 1 || multiple}
        onDrop={onDrop}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              "group relative grid h-40 w-full cursor-pointer place-items-center rounded-none border border-input border-dashed px-5 py-2.5 text-center transition hover:bg-muted/25",
              "ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isDragActive && "border-muted-foreground/50",
              isDisabled && "pointer-events-none opacity-60",
              className
            )}
            {...dropzoneProps}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center gap-3 sm:px-5">
                <div className="rounded-full border border-dashed p-2.5">
                  <UploadIcon
                    aria-hidden="true"
                    className="size-5 text-muted-foreground"
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Drop the files here
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 sm:px-5">
                <div className="rounded-full border border-dashed p-2.5">
                  <UploadIcon
                    aria-hidden="true"
                    className="size-5 text-muted-foreground"
                  />
                </div>
                <div className="flex flex-col gap-px">
                  <p className="text-muted-foreground text-xs">
                    Drag and drop files here, or click to select
                  </p>
                  <p className="text-muted-foreground/70 text-xs">
                    {maxFileCount > 1
                      ? `Up to ${maxFileCount === Number.POSITIVE_INFINITY ? "multiple" : maxFileCount} files (${formatBytes(maxSize)} each)`
                      : `Max file size: ${formatBytes(maxSize)}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>
      {files?.length ? (
        <ScrollArea className="h-fit w-full">
          <div className="flex max-h-32 flex-col gap-3">
            {files?.map((file, index) => (
              <FileCard
                file={file}
                key={`${file.name}-${file.lastModified}`}
                onRemove={() => onRemove(index)}
                progress={progresses?.[file.name]}
              />
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
}

interface FileCardProps {
  file: File;
  onRemove: () => void;
  progress?: number;
}

function FileCard({ file, progress, onRemove }: FileCardProps) {
  return (
    <div className="relative flex items-center gap-2.5">
      <div className="flex flex-1 gap-2.5">
        {isFileWithPreview(file) ? <FilePreview file={file} /> : null}
        <div className="flex w-full flex-col gap-1.5">
          <div className="flex flex-col gap-px">
            <p className="line-clamp-1 font-medium text-foreground/80 text-xs">
              {file.name}
            </p>
            <p className="text-muted-foreground text-xs">
              {formatBytes(file.size, 2, "accurate")}
            </p>
          </div>
          {progress ? <Progress value={progress} /> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          className="size-7"
          onClick={onRemove}
          size="icon"
          type="button"
          variant="outline"
        >
          <XIcon aria-hidden="true" className="size-4" />
          <span className="sr-only">Remove file</span>
        </Button>
      </div>
    </div>
  );
}

function isFileWithPreview(file: File): file is File & { preview: string } {
  return "preview" in file && typeof file.preview === "string";
}

interface FilePreviewProps {
  file: File & { preview: string };
}

function FilePreview({ file }: FilePreviewProps) {
  if (file.type.startsWith("image/")) {
    return (
      <Image
        alt={file.name}
        className="aspect-square shrink-0 rounded-none object-cover"
        height={48}
        loading="lazy"
        src={file.preview}
        width={48}
      />
    );
  }

  return (
    <FileTextIcon
      aria-hidden="true"
      className="size-10 text-muted-foreground"
    />
  );
}
