"use client";

import { unwrapLink, upsertLink } from "@platejs/link";
import { Link } from "lucide-react";
import { isUrl } from "platejs";
import { useEditorRef } from "platejs/react";
import type * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { ToolbarButton } from "./toolbar";

export function LinkToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [savedSelection, setSavedSelection] =
    useState<typeof editor.selection>(null);

  const submit = () => {
    const nextUrl = url.trim();

    // Restore editor selection that was lost when the dialog opened
    if (savedSelection) {
      editor.tf.select(savedSelection);
    }

    if (!nextUrl) {
      unwrapLink(editor);
      setOpen(false);
      editor.tf.focus();
      return;
    }

    if (!isUrl(nextUrl)) {
      toast.error("Invalid URL");
      return;
    }

    upsertLink(editor, {
      target: "_blank",
      url: nextUrl,
    });

    setOpen(false);
    setUrl("");
    editor.tf.focus();
  };

  return (
    <>
      <ToolbarButton
        {...props}
        data-plate-focus
        onClick={() => {
          setSavedSelection(editor.selection);
          setOpen(true);
        }}
        tooltip="Link"
      >
        <Link />
      </ToolbarButton>

      <AlertDialog onOpenChange={setOpen} open={open}>
        <AlertDialogContent className="gap-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Insert Link</AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogDescription className="w-full">
            <label
              className="mb-1 block font-medium text-sm"
              htmlFor="link-url"
            >
              URL
            </label>
            <Input
              autoFocus
              id="link-url"
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="https://example.com"
              type="url"
              value={url}
            />
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              Apply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
