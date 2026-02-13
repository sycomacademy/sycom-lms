"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { ThemeToggleIcon } from "@/components/icons/theme-toggle";
import { useKeyboardShortcutLabels } from "@/components/layout/keyboard-shortcuts";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const DARK_MODE_FORWARD_TYPE = "dark-mode-forward";

export function ModeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const shortcuts = useKeyboardShortcutLabels();
  useEffect(() => setMounted(true), []);

  // Defer theme to icon until after mount so server and first client render match (initial="normal").
  const themeForIcon = mounted
    ? (resolvedTheme as "dark" | "light")
    : undefined;

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className="group/toggle extend-touch-target size-8"
            onClick={toggleTheme}
            size="icon"
            variant="ghost"
          >
            <ThemeToggleIcon className="size-3.5" theme={themeForIcon} />
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />
      <TooltipContent className="flex items-center gap-2 pr-1">
        Toggle Mode <Kbd>{shortcuts.TOGGLE_THEME}</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
