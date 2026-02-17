"use client";

import { LineHeightPlugin } from "@platejs/basic-styles/react";

import { WrapText } from "lucide-react";
import { useEditorRef, useSelectionFragmentProp } from "platejs/react";
import { type ComponentProps, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ToolbarButton } from "./toolbar";

export function LineHeightToolbarButton(
  props: ComponentProps<typeof DropdownMenu>
) {
  const editor = useEditorRef();
  const { defaultNodeValue, validNodeValues: values = [] } =
    editor.getInjectProps(LineHeightPlugin);

  const value = useSelectionFragmentProp({
    defaultValue: defaultNodeValue,
    getProp: (node) => node.lineHeight,
  });

  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu modal={false} onOpenChange={setOpen} open={open} {...props}>
      <DropdownMenuTrigger
        render={
          <ToolbarButton isDropdown pressed={open} tooltip="Line height">
            <WrapText />
          </ToolbarButton>
        }
      />

      <DropdownMenuContent align="start" className="min-w-0">
        <DropdownMenuRadioGroup
          onValueChange={(newValue) => {
            editor
              .getTransforms(LineHeightPlugin)
              .lineHeight.setNodes(Number(newValue));
            editor.tf.focus();
          }}
          value={value}
        >
          {values.map((val) => (
            <DropdownMenuRadioItem
              className="min-w-[180px]"
              key={val}
              value={val}
            >
              {val}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
