"use client";

import { CollectionRecordDetail } from "@/types/record";
import { RecordsTable } from "./RecordsTable";

interface RecordHistorySectionProps {
  records: CollectionRecordDetail[];
  isLoading?: boolean;
  onView?: (record: CollectionRecordDetail) => void;
  onEdit?: (record: CollectionRecordDetail) => void;
  showTitle?: boolean;
}

export function RecordHistorySection({
  records,
  isLoading = false,
  onView,
  onEdit,
  showTitle = true,
}: RecordHistorySectionProps) {
  return (
    <div className="space-y-4">
      {showTitle && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Lịch sử bản ghi
          </h2>
          <p className="text-sm text-gray-600">Các bản ghi đã nộp</p>
        </div>
      )}

      <RecordsTable
        records={records}
        isLoading={isLoading}
        onView={onView}
        onEdit={onEdit}
      />
    </div>
  );
}
