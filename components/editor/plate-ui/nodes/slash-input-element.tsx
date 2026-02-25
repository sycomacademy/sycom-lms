/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: <explanation> */
"use client";

import {
  useComboboxInput,
  useHTMLInputCursorState,
} from "@platejs/combobox/react";
import { KEYS } from "platejs";
import type { PlateElementProps } from "platejs/react";
import { PlateElement, useEditorRef } from "platejs/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/packages/utils/cn";

const SLASH_COMMANDS = [
  { label: "Heading 1", value: KEYS.h1 },
  { label: "Heading 2", value: KEYS.h2 },
  { label: "Heading 3", value: KEYS.h3 },
  { label: "Paragraph", value: KEYS.p },
  { label: "Blockquote", value: KEYS.blockquote },
  { label: "Code Block", value: KEYS.codeBlock },
  { label: "Divider", value: KEYS.hr },
  { label: "Bullet List", value: "__bullet" },
  { label: "Numbered List", value: "__numbered" },
];

export function SlashInputElement(props: PlateElementProps) {
  const { children } = props;
  const editor = useEditorRef();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const cursorState = useHTMLInputCursorState(inputRef);

  const { props: comboboxProps, removeInput } = useComboboxInput({
    ref: inputRef,
    cancelInputOnBlur: false,
    cancelInputOnDeselect: false,
    cursorState,
    onCancelInput: (cause) => {
      if (cause !== "backspace") {
        editor.tf.insertText("/");
      }
    },
  });

  const filtered = search
    ? SLASH_COMMANDS.filter((cmd) =>
        cmd.label.toLowerCase().includes(search.toLowerCase())
      )
    : SLASH_COMMANDS;

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = useCallback(
    (value: string) => {
      removeInput(true);
      if (value === "__bullet") {
        editor.tf.setNodes({ listStyleType: "disc", indent: 1 });
        editor.tf.focus();
      } else if (value === "__numbered") {
        editor.tf.setNodes({ listStyleType: "decimal", indent: 1 });
        editor.tf.focus();
      } else {
        editor.tf.toggleBlock(value);
        editor.tf.focus();
      }
    },
    [editor, removeInput]
  );

  return (
    <PlateElement {...props} as="span">
      <span className="relative inline-flex items-center">
        <span className="text-muted-foreground">/{search}</span>
        <input
          {...comboboxProps}
          autoComplete="off"
          className="sr-only"
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
              return;
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setSelectedIndex((i) => Math.max(i - 1, 0));
              return;
            }
            if (e.key === "Enter" && filtered.length > 0) {
              e.preventDefault();
              handleSelect(filtered[selectedIndex]?.value ?? "");
              return;
            }
            comboboxProps.onKeyDown?.(e);
          }}
          ref={inputRef}
          value={search}
        />
        {filtered.length > 0 && (
          <div className="absolute top-full left-0 z-[500] mt-1 min-w-[180px] rounded-md border border-border bg-popover py-1 shadow-md">
            {filtered.map((cmd, i) => (
              <div
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-sm",
                  i === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50 hover:text-accent-foreground"
                )}
                key={cmd.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(cmd.value);
                }}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                {cmd.label}
              </div>
            ))}
          </div>
        )}
      </span>
      {children}
    </PlateElement>
  );
}
