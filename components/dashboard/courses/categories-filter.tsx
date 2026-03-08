"use client";

import { useQuery } from "@tanstack/react-query";
import { FilterMultiCombobox } from "@/components/dashboard/courses/filter-multi-combobox";
import { useTRPC } from "@/packages/trpc/client";

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
  const { data: categories = [] } = useQuery(trpc.category.list.queryOptions());

  return (
    <FilterMultiCombobox
      allLabel="All"
      className={className}
      emptyMessage="No categories found."
      filterLabel="Categories"
      items={categories.map((category) => ({
        label: category.name,
        value: category.id,
      }))}
      onChange={onChange}
      resetLabel="Reset"
      searchPlaceholder="Search categories..."
      showAllAsUnchecked
      value={value}
    />
  );
}
