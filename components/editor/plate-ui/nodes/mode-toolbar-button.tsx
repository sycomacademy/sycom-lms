"use client";

import { SuggestionPlugin } from "@platejs/suggestion/react";
import { EyeIcon, PencilLineIcon, PenIcon } from "lucide-react";
import { useEditorRef, usePlateState, usePluginOption } from "platejs/react";
import type React from "react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ToolbarButton } from "./toolbar";

export function ModeToolbarButton(
  props: React.ComponentProps<typeof DropdownMenu>
) {
  const editor = useEditorRef();
  const [readOnly, setReadOnly] = usePlateState("readOnly");
  const [open, setOpen] = useState(false);

  const isSuggesting = usePluginOption(SuggestionPlugin, "isSuggesting");

  let value = "editing";

  if (readOnly) {
    value = "viewing";
  }

  if (isSuggesting) {
    value = "suggestion";
  }

  const item: Record<string, { icon: React.ReactNode; label: string }> = {
    editing: {
      icon: <PenIcon />,
      label: "Editing",
    },
    suggestion: {
      icon: <PencilLineIcon />,
      label: "Suggestion",
    },
    viewing: {
      icon: <EyeIcon />,
      label: "Viewing",
    },
  };

  return (
    <DropdownMenu modal={false} onOpenChange={setOpen} open={open} {...props}>
      <DropdownMenuTrigger
        render={
          <ToolbarButton isDropdown pressed={open} tooltip="Editing mode">
            {item[value].icon}
            <span className="hidden lg:inline">{item[value].label}</span>
          </ToolbarButton>
        }
      />

      <DropdownMenuContent align="start" className="min-w-[180px]">
        <DropdownMenuRadioGroup
          onValueChange={(newValue) => {
            if (newValue === "viewing") {
              setReadOnly(true);

              return;
            }
            setReadOnly(false);

            if (newValue === "suggestion") {
              editor.setOption(SuggestionPlugin, "isSuggesting", true);

              return;
            }
            editor.setOption(SuggestionPlugin, "isSuggesting", false);

            if (newValue === "editing") {
              editor.tf.focus();

              return;
            }
          }}
          value={value}
        >
          <DropdownMenuRadioItem
            className="gap-2 *:[svg]:text-muted-foreground"
            value="editing"
          >
            {item.editing.icon}
            {item.editing.label}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem
            className="gap-2 *:[svg]:text-muted-foreground"
            value="viewing"
          >
            {item.viewing.icon}
            {item.viewing.label}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem
            className="gap-2 *:[svg]:text-muted-foreground"
            value="suggestion"
          >
            {item.suggestion.icon}
            {item.suggestion.label}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
