import { useState, useEffect, useCallback, useRef } from "react";
import { IPaginationMeta, IPaginationParams } from "@/types/pagination";

interface UseTableDataOptions<T, F> {
  fetchData: (
    filters: F,
    pagination: IPaginationParams,
    noCache?: boolean
  ) => Promise<{
    data: T[];
    pagination: IPaginationMeta;
  }>;
  filters: F;
  pagination: IPaginationMeta;
  setPagination?: (pagination: IPaginationMeta) => void; // Callback to update pagination
  dependencies?: any[]; // Additional dependencies that should trigger reload
  enabled?: boolean; // Whether to fetch data (default: true)
}

interface UseTableDataReturn<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  reload: (options?: { page?: number; limit?: number; noCache?: boolean }) => Promise<void>;
}

/**
 * Generic hook for managing table data fetching, loading, and error states
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, reload } = useTableData({
 *   fetchData: (filters, pagination) =>
 *     WasteOwnerService.getAllWasteOwners(filters, pagination),
 *   filters: { status: "active", type: "business" },
 *   pagination: { page: 1, limit: 20, total: 0, ... },
 *   dependencies: [selectedType, selectedStatus],
 * });
 * ```
 */
export function useTableData<T, F>(
  options: UseTableDataOptions<T, F>
): UseTableDataReturn<T> {
  const {
    fetchData,
    filters,
    pagination,
    setPagination,
    dependencies = [],
    enabled = true,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use refs to track current values and prevent infinite loops
  const paginationRef = useRef(pagination);
  const filtersRef = useRef(filters);

  // Update refs when values change
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Memoize filters string for stable comparison
  const filtersKey = JSON.stringify(filters);

  const loadData = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use refs to get current values to avoid dependency issues
      const currentPagination = paginationRef.current;
      const currentFilters = filtersRef.current;

      const response = await fetchData(
        currentFilters,
        {
          page: currentPagination.page,
          limit: currentPagination.limit,
        },
        false // Normal load uses cache
      );
      setData(response.data || []);

      // Update pagination if callback provided - only update metadata, not page/limit
      if (setPagination && response.pagination) {
        // Get current pagination from ref to avoid stale closure
        const currentPagination = paginationRef.current;

        // Only update if metadata actually changed
        if (
          currentPagination.total !== response.pagination.total ||
          currentPagination.totalPages !== response.pagination.totalPages ||
          currentPagination.hasNext !== response.pagination.hasNext ||
          currentPagination.hasPrev !== response.pagination.hasPrev
        ) {
          setPagination({
            ...currentPagination,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
            hasNext: response.pagination.hasNext,
            hasPrev: response.pagination.hasPrev,
          });
        }
      }
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error(err?.toString() || "Unknown error");
      setError(error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
    // Use stable dependencies - filtersKey changes only when filter values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, enabled, pagination.page, pagination.limit, filtersKey, ...dependencies]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Reload function that forces a fresh fetch using latest state
  // Accepts optional pagination override and noCache flag
  const reload = useCallback(async (options?: { page?: number; limit?: number; noCache?: boolean }) => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use provided options or fall back to current pagination
      const pageToUse = options?.page ?? pagination.page;
      const limitToUse = options?.limit ?? pagination.limit;

      const response = await fetchData(
        filters,
        {
          page: pageToUse,
          limit: limitToUse,
        },
        options?.noCache
      );

      setData(response.data || []);

      // Update pagination if callback provided
      if (setPagination && response.pagination) {
        setPagination({
          page: pageToUse,
          limit: limitToUse,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
          hasNext: response.pagination.hasNext,
          hasPrev: response.pagination.hasPrev,
        });
      }
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error(err?.toString() || "Unknown error");
      setError(error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, enabled, setPagination, filters, pagination]);

  return {
    data,
    isLoading,
    error,
    reload,
  };
}

