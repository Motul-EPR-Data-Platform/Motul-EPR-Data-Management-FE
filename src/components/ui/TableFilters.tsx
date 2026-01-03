"use client";

import { ReactNode } from "react";

interface TableFiltersProps {
  search?: ReactNode; // TaggedSearchBar or Input
  filters?: ReactNode[]; // Array of FilterSelect components
  actions?: ReactNode; // Action buttons (Create, Export, etc.)
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Composable filter section component for tables
 *
 * @example
 * ```tsx
 * <TableFilters
 *   title="Tất cả Chủ nguồn thải"
 *   subtitle="Doanh nghiệp và Cá nhân"
 *   search={<TaggedSearchBar ... />}
 *   filters={[
 *     <FilterSelect value={type} options={typeOptions} onChange={setType} />,
 *     <FilterSelect value={status} options={statusOptions} onChange={setStatus} />,
 *   ]}
 *   actions={<Button>Thêm mới</Button>}
 * />
 * ```
 */
export function TableFilters({
  search,
  filters,
  actions,
  title,
  subtitle,
  className = "",
}: TableFiltersProps) {
  return (
    <div className={`rounded-lg border bg-card p-6 space-y-4 ${className}`}>
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        {search && <div className="flex-1">{search}</div>}

        {filters && filters.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4">
            {filters.map((filter, index) => (
              <div key={index}>{filter}</div>
            ))}
          </div>
        )}

        {actions && <div className="flex items-center">{actions}</div>}
      </div>
    </div>
  );
}

