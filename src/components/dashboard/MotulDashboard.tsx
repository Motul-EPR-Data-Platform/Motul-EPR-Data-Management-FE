"use client";

import { SummaryMetricCard } from "./SummaryMetricCard";
import { LineChart, LineChartSeries } from "./LineChart";
import { VolumeByWasteOwnerChart } from "./VolumeByWasteOwnerChart";
import { PieChart, PieChartDataPoint } from "./PieChart";
import { TrendingUp, Clock, CheckCircle2, FileText } from "lucide-react";
import {
  mockDashboardMetrics,
  mockRecordsOverTime,
  mockWasteSourceClassification,
  lineChartColors,
} from "@/lib/mock/dashboard.mock";

export function MotulDashboard() {
  // Prepare line chart series
  const lineChartSeries: LineChartSeries[] = [
    { dataKey: "WTP 1", name: "WTP 1", color: lineChartColors[0] },
    { dataKey: "WTP 2", name: "WTP 2", color: lineChartColors[1] },
    { dataKey: "WTP 3", name: "WTP 3", color: lineChartColors[2] },
    { dataKey: "WTP 4", name: "WTP 4", color: lineChartColors[3] },
    { dataKey: "WTP 5", name: "WTP 5", color: lineChartColors[4] },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryMetricCard
          title="Tổng khối lượng đã thu gom"
          value={`${mockDashboardMetrics.totalCollectedVolumeKg} kg`}
          change={{
            value: mockDashboardMetrics.collectedVolumeChangePercent || 0,
            label: `+${mockDashboardMetrics.collectedVolumeChangePercent}% hơn tháng trước`,
            isPositive: true,
          }}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <SummaryMetricCard
          title="Tổng khối lượng tái chế"
          value={`${mockDashboardMetrics.totalRecycledVolumeKg} kg`}
          icon={<Clock className="w-5 h-5" />}
        />
        <SummaryMetricCard
          title="Bản ghi đã duyệt"
          value={mockDashboardMetrics.approvedRecords}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <SummaryMetricCard
          title="Tổng bản ghi"
          value={mockDashboardMetrics.totalRecords}
          change={{
            value: mockDashboardMetrics.totalRecordsChangeCount || 0,
            label: `+${mockDashboardMetrics.totalRecordsChangeCount} trong tháng này`,
            isPositive: true,
          }}
          icon={<FileText className="w-5 h-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Records Over Time */}
        <LineChart
          title="Số lượng bản ghi theo thời gian"
          subtitle="Xu hướng theo tháng"
          data={mockRecordsOverTime}
          series={lineChartSeries}
          xAxisKey="month"
          height={350}
        />

        {/* Bar Chart - Volume by Waste Owner */}
        <VolumeByWasteOwnerChart />
      </div>

      {/* Pie Chart - Waste Source Classification */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <PieChart
          title="Phân loại nguồn thải"
          subtitle="Phân bố theo loại nguồn thải"
          data={mockWasteSourceClassification}
          height={400}
        />
      </div>
    </div>
  );
}
