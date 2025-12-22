"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { RecordStatus } from "@/types/record";

interface RecordsFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export function RecordsFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: RecordsFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo ID, tên chủ nguồn thải..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Tất cả trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          <SelectItem value="draft">Bản nháp</SelectItem>
          <SelectItem value="pending">Đang chờ duyệt</SelectItem>
          <SelectItem value="approved">Đã được phê duyệt</SelectItem>
          <SelectItem value="rejected">Bị từ chối</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
