"use client";
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import { useMarkToolbarButton, useMarkToolbarButtonState } from "platejs/react";
import type * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/packages/utils/cn";
export interface MarkToolbarButtonProps
  extends React.ComponentProps<typeof ToolbarPrimitive.Button> {
  nodeType: string;
  clear?: string[] | string;
  tooltip?: string;
}
export function MarkToolbarButton({
  clear,
  nodeType,
  className,
  children,
  tooltip,
  ...props
}: MarkToolbarButtonProps) {
  const state = useMarkToolbarButtonState({ clear, nodeType });
  const { props: buttonProps } = useMarkToolbarButton(state);
  const button = (
    <ToolbarPrimitive.Button
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-2 font-medium text-xs outline-none transition-all",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-pressed:bg-muted",
        "[&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="mark-toolbar-button"
      render={<TogglePrimitive pressed={state.pressed} />}
      {...props}
      {...buttonProps}
    >
      {children}
    </ToolbarPrimitive.Button>
  );
  if (!tooltip) {
    return button;
  }
  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
