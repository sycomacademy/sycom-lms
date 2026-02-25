/** biome-ignore-all lint/a11y/useKeyWithClickEvents: Table toolbar interactions are mouse-driven */
/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: Table cells need interaction handlers */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: Table elements require custom interaction handling */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: Table rows/cols have stable indices */
/** biome-ignore-all lint/a11y/useSemanticElements: Custom table toolbar component */
/** biome-ignore-all lint/a11y/useFocusableInteractive: Custom focus management */
"use client";

import { deleteTable } from "@platejs/table";
import { TablePlugin, useTableMergeState } from "@platejs/table/react";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Combine,
  Grid3x3Icon,
  Table,
  Trash2Icon,
  Ungroup,
  XIcon,
} from "lucide-react";
import { KEYS } from "platejs";
import { useEditorPlugin, useEditorSelector } from "platejs/react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/packages/utils/cn";
import { ToolbarButton } from "../toolbar-button";

export function TableToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const tableSelected = useEditorSelector(
    (editor) => editor.api.some({ match: { type: KEYS.table } }),
    []
  );

  const { editor, tf } = useEditorPlugin(TablePlugin);
  const [open, setOpen] = useState(false);
  const mergeState = useTableMergeState();

  const runTableCommand = (command: () => void) => {
    command();
    editor.tf.focus();
    setOpen(false);
  };

  return (
    <DropdownMenu modal={false} onOpenChange={setOpen} open={open} {...props}>
      <DropdownMenuTrigger
        render={
          <ToolbarButton {...props} pressed={open} tooltip="Table">
            <Table />
          </ToolbarButton>
        }
      />

      <DropdownMenuContent
        align="start"
        className="flex w-[180px] min-w-0 flex-col"
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
              <Grid3x3Icon className="size-4" />
              <span>Table</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="m-0 p-0">
              <TablePicker />
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="gap-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              disabled={!tableSelected}
            >
              <div className="size-4" />
              <span>Cell</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!mergeState.canMerge}
                onSelect={() => {
                  runTableCommand(() => tf.table.merge());
                }}
              >
                <Combine />
                Merge cells
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!mergeState.canSplit}
                onSelect={() => {
                  runTableCommand(() => tf.table.split());
                }}
              >
                <Ungroup />
                Split cell
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="gap-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              disabled={!tableSelected}
            >
              <div className="size-4" />
              <span>Row</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  runTableCommand(() => tf.insert.tableRow({ before: true }));
                }}
              >
                <ArrowUp />
                Insert row before
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  runTableCommand(() => tf.insert.tableRow());
                }}
              >
                <ArrowDown />
                Insert row after
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  runTableCommand(() => tf.remove.tableRow());
                }}
              >
                <XIcon />
                Delete row
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="gap-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              disabled={!tableSelected}
            >
              <div className="size-4" />
              <span>Column</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  runTableCommand(() =>
                    tf.insert.tableColumn({ before: true })
                  );
                }}
              >
                <ArrowLeft />
                Insert column before
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  runTableCommand(() => tf.insert.tableColumn());
                }}
              >
                <ArrowRight />
                Insert column after
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  runTableCommand(() => tf.remove.tableColumn());
                }}
              >
                <XIcon />
                Delete column
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="min-w-[180px]"
            disabled={!tableSelected}
            onSelect={() => {
              runTableCommand(() => {
                deleteTable(editor);
                tf.remove.table();
              });
            }}
          >
            <Trash2Icon />
            Delete table
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TablePicker() {
  const { editor, tf } = useEditorPlugin(TablePlugin);

  const [tablePicker, setTablePicker] = useState({
    grid: Array.from({ length: 8 }, () => Array.from({ length: 8 }).fill(0)),
    size: { colCount: 0, rowCount: 0 },
  });

  const onCellMove = (rowIndex: number, colIndex: number) => {
    const newGrid = [...tablePicker.grid];

    for (let i = 0; i < newGrid.length; i++) {
      for (let j = 0; j < newGrid[i].length; j++) {
        newGrid[i][j] =
          i >= 0 && i <= rowIndex && j >= 0 && j <= colIndex ? 1 : 0;
      }
    }

    setTablePicker({
      grid: newGrid,
      size: { colCount: colIndex + 1, rowCount: rowIndex + 1 },
    });
  };

  return (
    <div
      className="flex! m-0 flex-col p-0"
      onClick={() => {
        tf.insert.table(tablePicker.size, { select: true });
        editor.tf.focus();
      }}
      role="button"
    >
      <div className="grid size-[130px] grid-cols-8 gap-0.5 p-1">
        {tablePicker.grid.map((rows, rowIndex) =>
          rows.map((value, columIndex) => (
            <div
              className={cn(
                "col-span-1 size-3 border border-solid bg-secondary",
                !!value && "border-current"
              )}
              key={`(${rowIndex},${columIndex})`}
              onMouseMove={() => {
                onCellMove(rowIndex, columIndex);
              }}
            />
          ))
        )}
      </div>

      <div className="text-center text-current text-xs">
        {tablePicker.size.rowCount} x {tablePicker.size.colCount}
      </div>
    </div>
  );
}
