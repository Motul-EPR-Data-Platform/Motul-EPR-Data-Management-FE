"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { WasteOwnerService } from "@/lib/services/waste-owner.service";
import { Search, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WasteOwner } from "@/types/waste-owner";

interface SearchableWasteOwnerSelectProps {
  value?: string | null; // wasteOwnerId
  onChange: (wasteOwnerId: string | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function SearchableWasteOwnerSelect({
  value = null,
  onChange,
  placeholder = "Tìm hoặc chọn từ danh sách....",
  label,
  required = false,
  disabled = false,
  error,
  className,
}: SearchableWasteOwnerSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [wasteOwners, setWasteOwners] = useState<WasteOwner[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWasteOwner, setSelectedWasteOwner] = useState<WasteOwner | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);

  const loadWasteOwners = useCallback(async (
    page: number,
    query: string = "",
    reset: boolean = false,
  ) => {
    try {
      const response = await WasteOwnerService.getAllWasteOwners(
        {
          isActive: true,
          ...(query && { name: query }),
        },
        { page, limit: 20 },
      );

      if (reset) {
        setWasteOwners(response.data);
      } else {
        setWasteOwners((prev) => [...prev, ...response.data]);
      }

      const pagination = response.pagination;
      setHasMore(pagination.hasNext || false);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading waste owners:", error);
      throw error;
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      await loadWasteOwners(1, "", true);
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [loadWasteOwners]);

  // Load selected waste owner by ID when value changes (for edit mode)
  useEffect(() => {
    if (value && !selectedWasteOwner) {
      const loadSelectedWasteOwner = async () => {
        try {
          const wasteOwner = await WasteOwnerService.getWasteOwnerById(value);
          setSelectedWasteOwner(wasteOwner);
        } catch (error) {
          console.error("Error loading selected waste owner:", error);
        }
      };
      loadSelectedWasteOwner();
    } else if (!value) {
      setSelectedWasteOwner(null);
    }
  }, [value, selectedWasteOwner]);

  // Load initial data when dropdown opens (only once)
  useEffect(() => {
    if (isOpen && isInitialLoadRef.current && wasteOwners.length === 0 && !searchQuery) {
      loadInitialData();
      isInitialLoadRef.current = false;
    }
  }, [isOpen, wasteOwners.length, searchQuery, loadInitialData]);

  // Debounced search - only trigger when searchQuery changes (not on initial open)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!isOpen) {
      return;
    }

    // Don't search on initial open (handled by loadInitialData)
    // Only search when user types something
    if (searchQuery === "") {
      // If we have no data and no query, initial load will handle it
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        await loadWasteOwners(1, searchQuery, true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, isOpen, loadWasteOwners]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      await loadWasteOwners(currentPage + 1, searchQuery, false);
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, searchQuery, hasMore, isLoadingMore]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight;

    // Load more when within 50px of bottom
    if (scrollBottom < 50 && hasMore && !isLoadingMore && !isLoading) {
      loadMore();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    
    // If user is typing and it's different from selected name, clear selection
    if (selectedWasteOwner && newQuery !== selectedWasteOwner.name) {
      setSelectedWasteOwner(null);
      onChange(null);
    }
    
    // Reset pagination when search changes
    if (newQuery !== searchQuery) {
      setCurrentPage(1);
      setHasMore(true);
    }
  };

  const handleSelect = (wasteOwner: WasteOwner) => {
    setSelectedWasteOwner(wasteOwner);
    setSearchQuery("");
    setIsOpen(false);
    onChange(wasteOwner.id);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    // Reload if closed and reopened
    if (wasteOwners.length === 0 && !isLoading) {
      loadInitialData();
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow click on results
    setTimeout(() => setIsOpen(false), 200);
  };

  // Display selected name when not searching, otherwise show search query
  const displayValue = isOpen && searchQuery ? searchQuery : (selectedWasteOwner?.name || "");

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
            <Input
              ref={inputRef}
              value={displayValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              className={cn(
                "pl-10 w-full",
                error && "border-red-500",
                disabled && "cursor-not-allowed",
              )}
            />
            {(isLoading || isLoadingMore) && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground pointer-events-none" />
            )}
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)]"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {wasteOwners.length > 0 ? (
            <div
              ref={scrollContainerRef}
              className="max-h-60 overflow-y-auto"
              onScroll={handleScroll}
            >
              {wasteOwners.map((wasteOwner) => {
                const isSelected = value === wasteOwner.id;
                return (
                  <button
                    key={wasteOwner.id}
                    type="button"
                    onClick={() => handleSelect(wasteOwner)}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors border-b last:border-b-0 flex items-center justify-between",
                      isSelected && "bg-blue-50 hover:bg-blue-100",
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {wasteOwner.name}
                      </p>
                      {wasteOwner.businessCode && (
                        <p className="text-xs text-gray-500 truncate">
                          Mã: {wasteOwner.businessCode}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 ml-2 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
              {isLoadingMore && (
                <div className="px-4 py-2 text-center text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                  Đang tải thêm...
                </div>
              )}
              {!hasMore && wasteOwners.length > 0 && (
                <div className="px-4 py-2 text-center text-xs text-gray-400">
                  Đã hiển thị tất cả
                </div>
              )}
            </div>
          ) : isLoading ? (
            <div className="p-4 text-center">
              <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
              <span className="text-sm text-gray-500">Đang tải...</span>
            </div>
          ) : searchQuery.length > 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Không tìm thấy chủ nguồn thải
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              Nhập để tìm kiếm
            </div>
          )}
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

