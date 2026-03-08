"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { cn } from "@/packages/utils/cn";

export interface FilterMultiComboboxItem {
  label: string;
  value: string;
}

interface FilterMultiComboboxProps {
  items: FilterMultiComboboxItem[];
  value: string[];
  onChange: (value: string[]) => void;
  filterLabel: string;
  allLabel: string;
  searchPlaceholder: string;
  emptyMessage: string;
  resetLabel?: string;
  showAllAsUnchecked?: boolean;
  className?: string;
}

export function FilterMultiCombobox({
  items,
  value,
  onChange,
  filterLabel,
  allLabel,
  searchPlaceholder,
  emptyMessage,
  resetLabel = "Clear all",
  showAllAsUnchecked = false,
  className,
}: FilterMultiComboboxProps) {
  const isAllMode = value.length === 0;
  let selectedItems = items.filter((item) => value.includes(item.value));
  if (isAllMode && !showAllAsUnchecked) {
    selectedItems = items;
  }
  const selectedValues = new Set(selectedItems.map((item) => item.value));

  let displayText = allLabel;
  if (value.length === 1) {
    displayText = selectedItems[0]?.label ?? allLabel;
  } else if (value.length > 1) {
    displayText = `${value.length} selected`;
  }

  return (
    <Combobox
      autoHighlight
      isItemEqualToValue={(a, b) => a?.value === b?.value}
      items={items}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      multiple
      onValueChange={(nextItems) => {
        const nextValue = nextItems?.map((item) => item.value) ?? [];

        onChange(nextValue.length === items.length ? [] : nextValue);
      }}
      value={selectedItems}
    >
      <ComboboxTrigger
        render={
          <Button
            className={cn("justify-between gap-2 font-normal", className)}
            size="sm"
            variant="outline"
          />
        }
      >
        <span className="truncate">
          {filterLabel}: {displayText}
        </span>
      </ComboboxTrigger>

      <ComboboxContent align="start" className="w-(--anchor-width)">
        <ComboboxInput placeholder={searchPlaceholder} showTrigger={false} />
        <div className="flex items-center justify-end border-b px-2 py-2">
          <button
            className="font-medium text-muted-foreground text-xs transition-colors hover:text-foreground"
            onClick={() => onChange([])}
            type="button"
          >
            {resetLabel}
          </button>
        </div>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(item: FilterMultiComboboxItem) => (
            <ComboboxItem key={item.value} value={item}>
              <Checkbox
                checked={selectedValues.has(item.value)}
                className="pointer-events-none"
              />
              <span>{item.label}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
