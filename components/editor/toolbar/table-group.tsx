"use client";

import type { Editor } from "@tiptap/react";
import { TableIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";
import { ToolbarGroup } from "@/components/ui/toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/packages/utils/cn";

const MAX_ROWS = 8;
const MAX_COLS = 8;

interface TableGroupProps {
  editor: Editor;
}

export function TableGroup({ editor }: TableGroupProps) {
  const [hoverRow, setHoverRow] = useState(0);
  const [hoverCol, setHoverCol] = useState(0);

  const handleInsert = useCallback(
    (rows: number, cols: number) => {
      editor
        .chain()
        .focus()
        .insertTable({ rows, cols, withHeaderRow: true })
        .run();
    },
    [editor]
  );

  return (
    <ToolbarGroup>
      <Popover>
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={<Button size="icon-xs" variant="ghost" />}
              />
            }
          >
            <TableIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent>Insert Table</TooltipContent>
        </Tooltip>
        <PopoverPopup align="start" side="bottom" sideOffset={8}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-muted-foreground text-xs">
              {hoverRow > 0 ? `${hoverRow} x ${hoverCol}` : "Select size"}
            </span>
            {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: visual grid; buttons inside are interactive */}
            <div
              className="grid gap-0.5"
              onMouseLeave={() => {
                setHoverRow(0);
                setHoverCol(0);
              }}
              style={{
                gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)`,
              }}
            >
              {Array.from({ length: MAX_ROWS * MAX_COLS }, (_, i) => {
                const row = Math.floor(i / MAX_COLS) + 1;
                const col = (i % MAX_COLS) + 1;
                const isHighlighted = row <= hoverRow && col <= hoverCol;
                return (
                  <button
                    className={cn(
                      "size-5 rounded-sm border border-border transition-colors",
                      isHighlighted
                        ? "border-primary bg-primary/20"
                        : "bg-background hover:bg-muted"
                    )}
                    key={i}
                    onClick={() => handleInsert(row, col)}
                    onMouseEnter={() => {
                      setHoverRow(row);
                      setHoverCol(col);
                    }}
                    type="button"
                  />
                );
              })}
            </div>
          </div>
        </PopoverPopup>
      </Popover>
    </ToolbarGroup>
  );
}
