"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Search, Loader2, MoreHorizontal } from "lucide-react";
import { BatchService } from "@/lib/services/batch.service";
import { ActiveBatch, BatchType } from "@/types/batch";
import { cn } from "@/lib/utils";

interface BatchDropdownProps {
  value?: string | null;
  onChange: (batchId: string | null) => void;
  batchType?: BatchType;
  disabled?: boolean;
  error?: string;
  className?: string;
  onShowDetails?: () => void; // Callback to show batch details dialog
}

export function BatchDropdown({
  value,
  onChange,
  batchType,
  disabled = false,
  error,
  className,
  onShowDetails,
}: BatchDropdownProps) {
  const [query, setQuery] = useState("");
  const [batches, setBatches] = useState<ActiveBatch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<ActiveBatch[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ActiveBatch | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch batches on mount
  useEffect(() => {
    const fetchBatches = async () => {
      setIsLoading(true);
      try {
        const data = await BatchService.getActiveBatchesForDropdown(batchType);
        setBatches(data);
        setFilteredBatches(data);
        
        // Set selected batch if value is provided
        if (value) {
          const selected = data.find((b) => b.id === value);
          if (selected) {
            setSelectedBatch(selected);
            setQuery(selected.batchName);
          }
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, [batchType, value]);

  // Filter batches based on search query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredBatches(batches);
    } else {
      const filtered = batches.filter((batch) =>
        batch.batchName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBatches(filtered);
    }
  }, [query, batches]);

  const handleSelect = (batch: ActiveBatch) => {
    setSelectedBatch(batch);
    setQuery(batch.batchName);
    setIsOpen(false);
    onChange(batch.id);
  };

  const handleClear = () => {
    setSelectedBatch(null);
    setQuery("");
    onChange(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery.length === 0) {
      setSelectedBatch(null);
      onChange(null);
    }
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (filteredBatches.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="batchId">
          Lô hàng <span className="text-red-500">*</span>
        </Label>
        {onShowDetails && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onShowDetails}
            disabled={disabled}
            className="h-7 px-2 text-xs"
          >
            <MoreHorizontal className="h-4 w-4 mr-1" />
            Chi tiết
          </Button>
        )}
      </div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
            <Input
              ref={inputRef}
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Tìm hoặc chọn lô hàng..."
              disabled={disabled || isLoading}
              className={cn(
                "pl-10 pr-10",
                error && "border-red-500",
                disabled && "cursor-not-allowed",
              )}
            />
            {selectedBatch && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            )}
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground pointer-events-none" />
            )}
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="p-0 max-w-md min-w-[200px]"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {filteredBatches.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              {filteredBatches.map((batch) => (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() => handleSelect(batch)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors border-b last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{batch.batchName}</p>
                      <p className="text-xs text-gray-500">
                        {batch.batchType === BatchType.PORT ? "Cảng" : "Nhà máy"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length > 0 && !isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Không tìm thấy lô hàng
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

