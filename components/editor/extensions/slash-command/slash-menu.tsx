"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "@/packages/utils/cn";
import type { SlashCommandItem } from "./commands";

export interface SlashMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

interface SlashMenuProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  clientRect: (() => DOMRect) | null;
}

export const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(
  function SlashMenu({ items, command, clientRect }, ref) {
    const MENU_WIDTH = 256;
    const MENU_MAX_HEIGHT = 288;
    const VIEWPORT_PADDING = 8;
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({
      left: 0,
      top: 0,
    });

    useEffect(() => {
      if (selectedIndex >= items.length) {
        setSelectedIndex(0);
      }
    }, [items.length, selectedIndex]);

    useEffect(() => {
      if (!clientRect) {
        return;
      }

      const rect = clientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = window.innerWidth - rect.left;
      const spaceLeft = rect.right;

      const side: "top" | "bottom" =
        spaceBelow >= MENU_MAX_HEIGHT || spaceBelow >= spaceAbove
          ? "bottom"
          : "top";

      const align: "start" | "end" =
        spaceRight >= MENU_WIDTH || spaceRight >= spaceLeft ? "start" : "end";

      const rawLeft = align === "start" ? rect.left : rect.right - MENU_WIDTH;
      const maxLeft = window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING;
      const left = Math.max(VIEWPORT_PADDING, Math.min(rawLeft, maxLeft));

      const rawTop =
        side === "bottom"
          ? rect.bottom + VIEWPORT_PADDING
          : rect.top - MENU_MAX_HEIGHT - VIEWPORT_PADDING;
      const maxTop = window.innerHeight - MENU_MAX_HEIGHT - VIEWPORT_PADDING;
      const top = Math.max(VIEWPORT_PADDING, Math.min(rawTop, maxTop));

      setPosition({
        left,
        top,
      });
    }, [clientRect]);

    useEffect(() => {
      const el = menuRef.current?.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      el?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [items, command]
    );

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return null;
    }

    const grouped = items.reduce<Record<string, SlashCommandItem[]>>(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      },
      {}
    );

    let flatIndex = 0;

    return (
      <div
        className="fixed z-50 w-64"
        style={{
          left: position.left,
          top: position.top,
        }}
      >
        <div
          className="max-h-72 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-lg"
          ref={menuRef}
        >
          {Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category}>
              <div className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
                {category}
              </div>
              {categoryItems.map((item) => {
                const currentIndex = flatIndex++;
                return (
                  <button
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
                      currentIndex === selectedIndex
                        ? "bg-muted text-foreground"
                        : "text-popover-foreground hover:bg-muted/50"
                    )}
                    data-index={currentIndex}
                    key={item.title}
                    onClick={() => selectItem(currentIndex)}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                    type="button"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-border bg-background">
                      <item.icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-xs">
                        {item.title}
                      </div>
                      <div className="truncate text-muted-foreground text-xs">
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
);
