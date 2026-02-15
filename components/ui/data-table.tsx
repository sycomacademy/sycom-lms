"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function renderHeaderCell<TData, TValue>(
  header: import("@tanstack/react-table").Header<TData, TValue>
) {
  if (header.column.getCanSort()) {
    return (
      <button
        className="flex h-full w-full cursor-pointer select-none items-center justify-between gap-2"
        onClick={header.column.getToggleSortingHandler()}
        type="button"
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
        {{
          asc: (
            <ChevronUpIcon
              aria-hidden="true"
              className="size-4 shrink-0 opacity-80"
            />
          ),
          desc: (
            <ChevronDownIcon
              aria-hidden="true"
              className="size-4 shrink-0 opacity-80"
            />
          ),
        }[header.column.getIsSorted() as string] ?? null}
      </button>
    );
  }
  return flexRender(header.column.columnDef.header, header.getContext());
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total?: number;
  pageSize?: number;
  pageIndex?: number;
  onPaginationChange?: (pagination: PaginationState) => void;
  manualPagination?: boolean;
  manualSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
}

function DataTable<TData, TValue>({
  columns,
  data,
  total,
  pageSize: controlledPageSize = 10,
  pageIndex: controlledPageIndex = 0,
  onPaginationChange,
  manualPagination = false,
  manualSorting = false,
  sorting: controlledSorting,
  onSortingChange,
}: DataTableProps<TData, TValue>) {
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    {
      pageIndex: controlledPageIndex,
      pageSize: controlledPageSize,
    }
  );

  const [internalSorting, setInternalSorting] = useState<SortingState>(
    controlledSorting ?? []
  );

  const pagination = manualPagination
    ? { pageIndex: controlledPageIndex, pageSize: controlledPageSize }
    : internalPagination;

  const sorting = controlledSorting ?? internalSorting;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    manualSorting,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      if (manualPagination && onPaginationChange) {
        onPaginationChange(next);
      } else {
        setInternalPagination(next);
      }
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      if (onSortingChange) {
        onSortingChange(next);
      } else {
        setInternalSorting(next);
      }
    },
    manualPagination,
    rowCount: total,
    state: {
      pagination,
      sorting,
    },
  });

  const pageCount = table.getPageCount();

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const size = header.column.getSize();
                  return (
                    <TableHead
                      key={header.id}
                      style={size ? { width: `${size}px` } : undefined}
                    >
                      {header.isPlaceholder ? null : renderHeaderCell(header)}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <p className="text-muted-foreground text-sm">Rows per page</p>
          <Select
            onValueChange={(value) => {
              table.setPageSize(value as number);
            }}
            value={pagination.pageSize}
          >
            <SelectTrigger
              aria-label="Rows per page"
              className="w-fit"
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-muted-foreground text-sm">
            <span className="font-medium text-foreground">
              {pagination.pageIndex * pagination.pageSize + 1}-
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                total ?? data.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {total ?? data.length}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon-sm"
            variant="outline"
          >
            <span className="sr-only">Previous page</span>
            <ChevronLeftIcon />
          </Button>
          <span className="text-sm tabular-nums">
            {pagination.pageIndex + 1}{" "}
            <span className="text-muted-foreground">/ {pageCount || 1}</span>
          </span>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon-sm"
            variant="outline"
          >
            <span className="sr-only">Next page</span>
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { DataTable, type DataTableProps };
