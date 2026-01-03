"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterSelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface FilterSelectProps<T extends string = string> {
  value: T;
  options: FilterSelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  resetPageOnChange?: boolean; // default: true
  urlParamName?: string; // for URL sync (handled by parent)
  disabled?: boolean;
}

/**
 * Generic filter Select component for table filters
 *
 * @example
 * ```tsx
 * <FilterSelect
 *   value={statusFilter}
 *   options={[
 *     { value: "all", label: "Tất cả trạng thái" },
 *     { value: "active", label: "Hoạt động" },
 *     { value: "inactive", label: "Không hoạt động" },
 *   ]}
 *   onChange={setStatusFilter}
 *   placeholder="Tất cả trạng thái"
 * />
 * ```
 */
export function FilterSelect<T extends string = string>({
  value,
  options,
  onChange,
  placeholder,
  label,
  className,
  resetPageOnChange = true,
  disabled = false,
}: FilterSelectProps<T>) {
  const handleValueChange = (newValue: T) => {
    onChange(newValue);
    // Note: Page reset should be handled by parent component
    // This component is stateless and just triggers onChange
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium mb-2 block">{label}</label>
      )}
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

