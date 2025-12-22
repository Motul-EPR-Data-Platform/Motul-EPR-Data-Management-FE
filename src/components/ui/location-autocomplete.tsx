"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LocationService } from "@/lib/services/location.service";
import { VietmapAutocompleteResult } from "@/types/location";
import { Search, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LocationAutocompleteProps {
  value?: string; // refId or display address
  onSelect: (result: {
    refId: string;
    display: string;
    address: string;
  }) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function LocationAutocomplete({
  value = "",
  onSelect,
  placeholder = "Tìm hoặc chọn từ danh sách....",
  label,
  required = false,
  disabled = false,
  error,
  className,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VietmapAutocompleteResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDisplay, setSelectedDisplay] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const searchResults = await LocationService.searchAddress(query);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
      } catch (error) {
        console.error("Location search error:", error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Update display value when external value changes
  useEffect(() => {
    if (value && !query) {
      setSelectedDisplay(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSelectedDisplay(newQuery);
    if (newQuery.length === 0) {
      setIsOpen(false);
      setResults([]);
    }
  };

  const handleSelect = (result: VietmapAutocompleteResult) => {
    setSelectedDisplay(result.display);
    setQuery("");
    setIsOpen(false);
    setResults([]);
    onSelect({
      refId: result.ref_id,
      display: result.display,
      address: result.address,
    });
  };

  const handleInputFocus = () => {
    if (query.length >= 2 && results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay closing to allow click on results
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              ref={inputRef}
              value={selectedDisplay}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "pl-10",
                error && "border-red-500",
                disabled && "cursor-not-allowed",
              )}
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          {results.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.ref_id}
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors border-b last:border-b-0"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.display}
                      </p>
                      {result.address && result.address !== result.display && (
                        <p className="text-xs text-gray-500 truncate">
                          {result.address}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 && !isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Không tìm thấy địa chỉ
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
