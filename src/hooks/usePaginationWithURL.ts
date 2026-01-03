import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IPaginationMeta } from "@/types/pagination";

interface UsePaginationWithURLOptions {
  initialPage?: number;
  initialLimit?: number;
  paramNames?: {
    page?: string;
    limit?: string;
  };
  syncToURL?: boolean; // default: true
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

interface UsePaginationWithURLReturn {
  pagination: IPaginationMeta;
  setPagination: React.Dispatch<React.SetStateAction<IPaginationMeta>>;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (limit: number) => void;
  resetPagination: () => void;
  resetToPageOne: () => void;
}

/**
 * Pagination hook with automatic URL synchronization
 *
 * @example
 * ```tsx
 * const { pagination, handlePageChange, handlePageSizeChange } =
 *   usePaginationWithURL({
 *     initialPage: 1,
 *     initialLimit: 20,
 *   });
 *
 * // Use with API call
 * const response = await MyService.getItems({
 *   page: pagination.page,
 *   limit: pagination.limit,
 * });
 *
 * // Update pagination with API response
 * setPagination(response.pagination);
 * ```
 */
export function usePaginationWithURL(
  options: UsePaginationWithURLOptions = {}
): UsePaginationWithURLReturn {
  const {
    initialPage = 1,
    initialLimit = 20,
    paramNames = { page: "page", limit: "limit" },
    syncToURL = true,
    onPageChange,
    onLimitChange,
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL or defaults
  const getInitialPageValue = () => {
    if (!syncToURL) return initialPage;
    const page = searchParams.get(paramNames.page || "page");
    return page ? parseInt(page, 10) : initialPage;
  };

  const getInitialLimitValue = () => {
    if (!syncToURL) return initialLimit;
    const limit = searchParams.get(paramNames.limit || "limit");
    return limit ? parseInt(limit, 10) : initialLimit;
  };

  const [pagination, setPagination] = useState<IPaginationMeta>(() => ({
    page: getInitialPageValue(),
    limit: getInitialLimitValue(),
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  }));

  // Get current URL values - memoized to prevent recreation
  const urlPage = useMemo(() => {
    if (!syncToURL) return initialPage;
    const page = searchParams.get(paramNames.page || "page");
    return page ? parseInt(page, 10) : initialPage;
  }, [searchParams, paramNames.page, initialPage, syncToURL]);

  const urlLimit = useMemo(() => {
    if (!syncToURL) return initialLimit;
    const limit = searchParams.get(paramNames.limit || "limit");
    return limit ? parseInt(limit, 10) : initialLimit;
  }, [searchParams, paramNames.limit, initialLimit, syncToURL]);

  // Sync from URL when URL params change externally
  useEffect(() => {
    if (syncToURL) {
      // Only update if values actually changed to prevent infinite loops
      if (urlPage !== pagination.page || urlLimit !== pagination.limit) {
        setPagination((prev) => {
          // Only update if values are different
          if (prev.page === urlPage && prev.limit === urlLimit) {
            return prev; // Return same reference if no change
          }
          return {
            ...prev,
            page: urlPage,
            limit: urlLimit,
          };
        });
      }
    }
    // Only depend on searchParams and computed values, not pagination to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, urlPage, urlLimit, syncToURL]);

  // Update URL when pagination changes (if syncToURL is enabled)
  // Use useEffect to avoid calling router during render
  useEffect(() => {
    if (!syncToURL) return;

    const params = new URLSearchParams(searchParams.toString());
    const pageParam = paramNames.page || "page";
    const limitParam = paramNames.limit || "limit";

    const currentPage = pagination.page;
    const currentLimit = pagination.limit;

    // Check if URL needs updating
    const urlPage = searchParams.get(pageParam);
    const urlLimit = searchParams.get(limitParam);
    const urlPageNum = urlPage ? parseInt(urlPage, 10) : initialPage;
    const urlLimitNum = urlLimit ? parseInt(urlLimit, 10) : initialLimit;

    // Only update if different from URL
    if (currentPage !== urlPageNum || currentLimit !== urlLimitNum) {
      if (currentPage === initialPage) {
        params.delete(pageParam);
      } else {
        params.set(pageParam, String(currentPage));
      }

      if (currentLimit === initialLimit) {
        params.delete(limitParam);
      } else {
        params.set(limitParam, String(currentLimit));
      }

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      // Use router.replace to avoid adding to history
      router.replace(newUrl, { scroll: false });
    }
    // Only depend on pagination values, not the whole object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, syncToURL, router, searchParams, paramNames, initialPage, initialLimit]);

  const handlePageChange = useCallback(
    (page: number) => {
      setPagination((prev) => {
        const newPagination = { ...prev, page };
        onPageChange?.(page);
        return newPagination;
      });
    },
    [onPageChange]
  );

  const handlePageSizeChange = useCallback(
    (limit: number) => {
      setPagination((prev) => {
        const newPagination = { ...prev, page: 1, limit };
        onLimitChange?.(limit);
        return newPagination;
      });
    },
    [onLimitChange]
  );

  const resetPagination = useCallback(() => {
    const reset = {
      page: initialPage,
      limit: initialLimit,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    };
    setPagination(reset);
  }, [initialPage, initialLimit]);

  const resetToPageOne = useCallback(() => {
    setPagination((prev) => {
      if (prev.page === 1) {
        return prev; // No change needed
      }
      return { ...prev, page: 1 };
    });
  }, []);

  return {
    pagination,
    setPagination,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
    resetToPageOne,
  };
}

