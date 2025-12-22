"use client";

interface StatusCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
}

interface RecordSummaryCardsProps {
  counts: StatusCounts;
}

function SummaryCard({
  label,
  value,
  color = "text-gray-600",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export function RecordSummaryCards({ counts }: RecordSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <SummaryCard label="Số bản ghi tổng cộng" value={counts.total} />
      <SummaryCard
        label="Đang chờ duyệt"
        value={counts.pending}
        color="text-orange-600"
      />
      <SummaryCard
        label="Đã được phê duyệt"
        value={counts.approved}
        color="text-green-600"
      />
      <SummaryCard
        label="Bị từ chối"
        value={counts.rejected}
        color="text-red-600"
      />
      <SummaryCard label="Bản nháp" value={counts.draft} />
    </div>
  );
}
