"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";
import { ThemeToggleIcon } from "@/components/icons/theme-toggle";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useKeyboard } from "@/packages/hooks/use-keyboard";

export const DARK_MODE_FORWARD_TYPE = "dark-mode-forward";

export function ModeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useKeyboard({
    bindings: [
      {
        key: "d",
        onKey: toggleTheme,
        preventDefault: true,
        ignoreInputs: true,
      },
    ],
  });

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
            <ThemeToggleIcon className="size-4.5" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />
      <TooltipContent className="flex items-center gap-2 pr-1">
        Toggle Mode <Kbd>D</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
