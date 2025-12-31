import { useState, useCallback } from "react";
import { IPaginationMeta } from "@/types/pagination";

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

interface UsePaginationReturn {
  pagination: IPaginationMeta;
  setPagination: React.Dispatch<React.SetStateAction<IPaginationMeta>>;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (limit: number) => void;
  resetPagination: () => void;
}

/**
 * Custom hook for managing pagination state
 * 
 * @example
 * ```tsx
 * const { 
 *   pagination, 
 *   handlePageChange, 
 *   handlePageSizeChange 
 * } = usePagination({ initialPage: 1, initialLimit: 20 });
 * 
 * // Use with API call
 * const data = await MyService.getItems(filters, {
 *   page: pagination.page,
 *   limit: pagination.limit
 * });
 * 
 * // Update pagination with API response
 * setPagination(response.pagination);
 * ```
 */
export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const { initialPage = 1, initialLimit = 20 } = options;

  const [pagination, setPagination] = useState<IPaginationMeta>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, page: 1, limit }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({
      page: initialPage,
      limit: initialLimit,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    });
  }, [initialPage, initialLimit]);

  return {
    pagination,
    setPagination,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
  };
}
