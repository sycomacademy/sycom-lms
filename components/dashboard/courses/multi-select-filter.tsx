"use client";

import {
  FilterMultiCombobox,
  type FilterMultiComboboxItem,
} from "@/components/dashboard/courses/filter-multi-combobox";

export interface MultiSelectFilterOption extends FilterMultiComboboxItem {}

interface MultiSelectFilterProps {
  options: MultiSelectFilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
  triggerLabel: string;
  allLabel: string;
  resetLabel?: string;
  showAllAsUnchecked?: boolean;
  className?: string;
}

export function MultiSelectFilter({
  options,
  value,
  onChange,
  triggerLabel,
  allLabel,
  resetLabel,
  showAllAsUnchecked = false,
  className,
}: MultiSelectFilterProps) {
  return (
    <FilterMultiCombobox
      allLabel={allLabel}
      className={className}
      emptyMessage={`No ${triggerLabel.toLowerCase()} found.`}
      filterLabel={triggerLabel}
      items={options}
      onChange={onChange}
      resetLabel={resetLabel}
      searchPlaceholder={`Search ${triggerLabel.toLowerCase()}...`}
      showAllAsUnchecked={showAllAsUnchecked}
      value={value}
    />
  );
}
