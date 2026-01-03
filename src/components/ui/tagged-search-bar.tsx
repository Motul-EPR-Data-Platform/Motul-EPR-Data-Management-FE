"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, X } from "lucide-react";

export interface SearchTag {
  value: string;
  label: string;
}

interface TaggedSearchBarProps {
  value: string;
  selectedTag: string;
  tags: SearchTag[];
  onValueChange: (value: string) => void;
  onTagChange: (tag: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TaggedSearchBar({
  value,
  selectedTag,
  tags,
  onValueChange,
  onTagChange,
  placeholder = "Tìm kiếm...",
  disabled = false,
}: TaggedSearchBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedTagLabel = tags.find((tag) => tag.value === selectedTag)?.label || tags[0]?.label || "";

  const handleTagSelect = (tagValue: string) => {
    onTagChange(tagValue);
    setIsDropdownOpen(false);
  };

  const handleClear = () => {
    onValueChange("");
  };

  return (
    <div className="relative flex-1 flex items-center border rounded-md bg-background overflow-hidden">
      {/* Category selector button on the left */}
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-10 px-4 rounded-l-md rounded-r-none border-r border-border hover:bg-muted/50 shrink-0 font-medium"
            disabled={disabled}
            title="Chọn trường tìm kiếm"
            aria-label="Chọn trường tìm kiếm"
          >
            <span className="mr-2">{selectedTagLabel}</span>
            <span className={`text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Tìm kiếm theo:
          </div>
          {tags.map((tag) => (
            <DropdownMenuItem
              key={tag.value}
              onClick={() => handleTagSelect(tag.value)}
              className={selectedTag === tag.value ? "bg-accent" : ""}
            >
              <div className="flex items-center justify-between w-full">
                <span>{tag.label}</span>
                {selectedTag === tag.value && (
                  <span className="text-xs text-muted-foreground">✓</span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search input on the right */}
      <div className="relative flex-1 flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground z-10" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={disabled}
          className="border-0 rounded-l-none rounded-r-md focus-visible:ring-0 focus-visible:ring-offset-0 pl-10 pr-10 h-10"
        />

        {/* Clear button inside input */}
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 h-8 w-8 rounded hover:bg-muted shrink-0"
            onClick={handleClear}
            disabled={disabled}
            title="Xóa tìm kiếm"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

