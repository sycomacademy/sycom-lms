"use client";

import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/packages/utils/cn";

export interface MultiSelectFilterOption {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  options: MultiSelectFilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
  triggerLabel: string;
  allLabel: string;
  className?: string;
}

export function MultiSelectFilter({
  options,
  value,
  onChange,
  triggerLabel,
  allLabel,
  className,
}: MultiSelectFilterProps) {
  const effectiveSelected =
    value.length === 0 ? options.map((o) => o.value) : value;
  const selectedSet = new Set(effectiveSelected);
  const allSelected = value.length === 0 || value.length === options.length;

  let displayText = allLabel;
  if (!allSelected) {
    displayText =
      value.length === 1
        ? (options.find((o) => o.value === value[0])?.label ??
          value.length.toString())
        : `${value.length} selected`;
  }

  const toggle = (optionValue: string) => {
    const isChecked = selectedSet.has(optionValue);
    if (isChecked) {
      if (value.length === 0) {
        onChange(
          options.filter((o) => o.value !== optionValue).map((o) => o.value)
        );
      } else {
        const next = value.filter((v) => v !== optionValue);
        onChange(next);
      }
    } else {
      const next = value.length === 0 ? [optionValue] : [...value, optionValue];
      onChange(next.length === options.length ? [] : next);
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
            <span className="truncate">
              {triggerLabel}: {displayText}
            </span>
            <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-(--anchor-width)">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-end border-b pb-2">
            <button
              className="font-medium text-muted-foreground text-xs hover:text-foreground"
              onClick={clearAll}
              type="button"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            {options.map((opt) => (
              <label
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:underline"
                htmlFor={`multi-select-${triggerLabel}-${opt.value}`}
                key={opt.value}
              >
                <Checkbox
                  checked={selectedSet.has(opt.value)}
                  id={`multi-select-${triggerLabel}-${opt.value}`}
                  onCheckedChange={() => toggle(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
