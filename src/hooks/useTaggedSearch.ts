import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchTag } from "@/components/ui/tagged-search-bar";

interface UseTaggedSearchOptions {
  tags: SearchTag[];
  defaultTag?: string;
  searchParamName?: string;
  tagParamName?: string;
  debounceMs?: number;
}

interface UseTaggedSearchReturn {
  searchQuery: string;
  debouncedSearchQuery: string;
  selectedTag: string;
  setSearchQuery: (value: string) => void;
  setSelectedTag: (tag: string) => void;
  updateURLParams: (updates: {
    search?: string;
    tag?: string;
    page?: number;
  }) => void;
}

/**
 * Generic hook for managing tagged search state with URL synchronization
 *
 * @example
 * ```tsx
 * const tags = [
 *   { value: "name", label: "Tên" },
 *   { value: "businessCode", label: "Mã số thuế / CCCD" }
 * ];
 *
 * const {
 *   searchQuery,
 *   debouncedSearchQuery,
 *   selectedTag,
 *   setSearchQuery,
 *   setSelectedTag,
 *   updateURLParams
 * } = useTaggedSearch({ tags, defaultTag: "name" });
 * ```
 */
export function useTaggedSearch({
  tags,
  defaultTag,
  searchParamName = "search",
  tagParamName = "searchField",
  debounceMs = 500,
}: UseTaggedSearchOptions): UseTaggedSearchReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL params
  const getInitialSearch = () => {
    return searchParams.get(searchParamName) || "";
  };

  const getInitialTag = (): string => {
    const urlTag = searchParams.get(tagParamName);
    if (urlTag && tags.some((tag) => tag.value === urlTag)) {
      return urlTag;
    }
    return defaultTag || tags[0]?.value || "";
  };

  const [searchQuery, setSearchQuery] = useState(getInitialSearch());
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(getInitialSearch());
  const [selectedTag, setSelectedTag] = useState<string>(getInitialTag());
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Update URL params when state changes
  const updateURLParams = useCallback(
    (updates: {
      search?: string;
      tag?: string;
      page?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.search !== undefined) {
        if (updates.search === "") {
          params.delete(searchParamName);
        } else {
          params.set(searchParamName, updates.search);
        }
      }

      if (updates.tag !== undefined) {
        const defaultTagValue = defaultTag || tags[0]?.value || "";
        if (updates.tag === defaultTagValue) {
          params.delete(tagParamName);
        } else {
          params.set(tagParamName, updates.tag);
        }
      }

      if (updates.page !== undefined) {
        if (updates.page === 1) {
          params.delete("page");
        } else {
          params.set("page", String(updates.page));
        }
      }

      const newUrl = params.toString()
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;

      // Defer router update to avoid calling it during render
      queueMicrotask(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [router, searchParams, searchParamName, tagParamName, defaultTag, tags]
  );

  // Sync state from URL when URL params change externally (e.g., browser back/forward)
  useEffect(() => {
    const urlSearch = getInitialSearch();
    const urlTag = getInitialTag();

    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
      setDebouncedSearchQuery(urlSearch);
    }

    if (urlTag !== selectedTag) {
      setSelectedTag(urlTag);
    }

    if (isInitialMount) {
      setIsInitialMount(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Debounce search query - only update debounced value and URL after user stops typing
  useEffect(() => {
    if (!isInitialMount) {
      const delaySearch = setTimeout(() => {
        // Only reset page if search actually changed (not just typing)
        const searchChanged = debouncedSearchQuery !== searchQuery;

        if (searchChanged) {
          // Update debounced value (this will trigger data reload)
          setDebouncedSearchQuery(searchQuery);

          // Update URL and reset page to 1 for new search
          updateURLParams({ search: searchQuery, tag: selectedTag, page: 1 });
        }
      }, debounceMs);
      return () => clearTimeout(delaySearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedTag, isInitialMount, debounceMs]);

  // Handle tag change
  const handleTagChange = useCallback((tag: string) => {
    setSelectedTag(tag);
    updateURLParams({ tag, page: 1 });
    // If there's a search query, trigger reload by updating debounced value
    if (searchQuery.trim()) {
      setDebouncedSearchQuery(searchQuery);
    }
  }, [searchQuery, updateURLParams]);

  return {
    searchQuery,
    debouncedSearchQuery,
    selectedTag,
    setSearchQuery,
    setSelectedTag: handleTagChange,
    updateURLParams,
  };
}

