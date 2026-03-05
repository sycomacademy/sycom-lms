"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface OpenEditorUrlDialogOptions {
  title: string;
  placeholder: string;
  onSubmit: (value: string) => void;
}

interface UrlDialogContentProps extends OpenEditorUrlDialogOptions {
  onClose: () => void;
}

function UrlDialogContent({
  title,
  placeholder,
  onSubmit,
  onClose,
}: UrlDialogContentProps) {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      const timeoutId = window.setTimeout(onClose, 0);
      return () => window.clearTimeout(timeoutId);
    }

    const timeoutId = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [open, onClose]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }
      onSubmit(trimmed);
      setOpen(false);
    },
    [onSubmit, value]
  );

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Paste a valid URL to embed the media.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-0">
            <Input
              onChange={(event) => setValue(event.target.value)}
              placeholder={placeholder}
              ref={inputRef}
              type="url"
              value={value}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Insert</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function openEditorUrlDialog(options: OpenEditorUrlDialogOptions) {
  const mountNode = document.createElement("div");
  document.body.appendChild(mountNode);

  const root = createRoot(mountNode);
  let isUnmounted = false;

  const cleanup = () => {
    if (isUnmounted) {
      return;
    }

    isUnmounted = true;

    window.setTimeout(() => {
      root.unmount();
      mountNode.remove();
    }, 0);
  };

  root.render(<UrlDialogContent {...options} onClose={cleanup} />);
}
