"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDownIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTRPC } from "@/packages/trpc/client";
import { cn } from "@/packages/utils/cn";

interface CategoriesFilterProps {
  value: string[];
  onChange: (categoryIds: string[]) => void;
  className?: string;
}

export function CategoriesFilter({
  value,
  onChange,
  className,
}: CategoriesFilterProps) {
  const trpc = useTRPC();
  const { data: categories = [] } = useSuspenseQuery(
    trpc.category.list.queryOptions()
  );

  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSet = new Set(value);
  const allSelected = value.length === 0;

  let displayText = "All";
  if (!allSelected) {
    displayText =
      value.length === 1
        ? (categories.find((c) => c.id === value[0])?.name ?? "1 selected")
        : `${value.length} selected`;
  }

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      const next = value.filter((v) => v !== id);
      onChange(next);
    } else {
      const next = [...value, id];
      onChange(next.length === categories.length ? [] : next);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            className={cn("w-fit justify-between gap-2", className)}
            size="sm"
            variant="outline"
          >
            <span className="truncate">Categories: {displayText}</span>
            <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-(--anchor-width)">
        <div className="flex flex-col gap-1">
          <div className="relative">
            <SearchIcon className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-7 pl-7 text-xs"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              value={search}
            />
          </div>
          <div className="flex items-center justify-end border-b pb-2">
            <button
              className="font-medium text-muted-foreground text-xs hover:text-foreground"
              onClick={clearAll}
              type="button"
            >
              Clear all
            </button>
          </div>
          <div className="flex max-h-[200px] flex-col gap-0.5 overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <p className="px-2 py-3 text-center text-muted-foreground text-xs">
                No categories found.
              </p>
            ) : (
              filteredCategories.map((cat) => (
                <label
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:underline"
                  htmlFor={`cat-filter-${cat.id}`}
                  key={cat.id}
                >
                  <Checkbox
                    checked={selectedSet.has(cat.id)}
                    id={`cat-filter-${cat.id}`}
                    onCheckedChange={() => toggle(cat.id)}
                  />
                  <span>{cat.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
