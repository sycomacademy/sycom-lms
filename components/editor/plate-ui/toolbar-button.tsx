"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import type * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/packages/utils/cn";

// Base toolbar button with consistent styling
interface ToolbarButtonProps
  extends React.ComponentProps<typeof ToolbarPrimitive.Button> {
  tooltip?: string;
  pressed?: boolean;
}

export function ToolbarButton({
  className,
  children,
  tooltip,
  pressed,
  ...props
}: ToolbarButtonProps) {
  const buttonElement = (
    <ToolbarPrimitive.Button
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-xs outline-none transition-all",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-pressed:bg-muted aria-pressed:text-foreground",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="toolbar-button"
      render={
        pressed !== undefined ? (
          <TogglePrimitive pressed={pressed} />
        ) : undefined
      }
      {...props}
    >
      {children}
    </ToolbarPrimitive.Button>
  );

  if (!tooltip) {
    return buttonElement;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={buttonElement} />
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
