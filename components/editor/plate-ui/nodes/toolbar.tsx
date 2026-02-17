"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";

import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/packages/utils/cn";

interface ToolbarButtonProps
  extends React.ComponentProps<typeof ToolbarPrimitive.Button> {
  tooltip?: string;
  pressed?: boolean;
  isDropdown?: boolean;
}

export function ToolbarButton({
  className,
  children,
  tooltip,
  pressed,
  isDropdown,
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
      {isDropdown && <ChevronDownIcon className="ml-0.5 size-3" />}
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

// Toolbar menu group with label
interface ToolbarMenuGroupProps
  extends Omit<React.ComponentProps<typeof DropdownMenuRadioGroup>, "label"> {
  label?: string;
}

export function ToolbarMenuGroup({
  label,
  children,
  ...props
}: ToolbarMenuGroupProps) {
  return (
    <DropdownMenuRadioGroup {...props}>
      {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
      {children}
    </DropdownMenuRadioGroup>
  );
}

// Split button container
interface ToolbarSplitButtonProps extends React.ComponentProps<"div"> {
  pressed?: boolean;
}

export function ToolbarSplitButton({
  className,
  pressed,
  children,
  ...props
}: ToolbarSplitButtonProps) {
  return (
    <div
      className={cn(
        "group inline-flex rounded-md",
        pressed && "bg-muted",
        className
      )}
      data-slot="toolbar-split-button"
      {...props}
    >
      {children}
    </div>
  );
}

// Primary part of split button
export function ToolbarSplitButtonPrimary({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Button>) {
  return (
    <ToolbarPrimitive.Button
      className={cn(
        "inline-flex h-7 min-w-7 items-center justify-center rounded-r-none rounded-l-md px-1.5 text-xs outline-none transition-all",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="toolbar-split-button-primary"
      {...props}
    >
      {children}
    </ToolbarPrimitive.Button>
  );
}

// Secondary/dropdown part of split button
export function ToolbarSplitButtonSecondary({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Button>) {
  return (
    <ToolbarPrimitive.Button
      className={cn(
        "inline-flex h-7 w-4 items-center justify-center rounded-r-md rounded-l-none border-l border-l-border px-0 text-xs outline-none transition-all",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      data-slot="toolbar-split-button-secondary"
      {...props}
    >
      <ChevronDownIcon className="size-3" />
    </ToolbarPrimitive.Button>
  );
}
