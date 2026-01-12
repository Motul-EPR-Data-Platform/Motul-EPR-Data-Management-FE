"use client";

import { useState, useEffect } from "react";
import { SummaryMetricCard } from "./SummaryMetricCard";
import { MonthlyCollectionChart } from "./MonthlyCollectionChart";
import { WasteSourceDistributionChart } from "./WasteSourceDistributionChart";
import { WasteTypeTrendsChart } from "./WasteTypeTrendsChart";
import { DashboardService } from "@/lib/services/dashboard.service";
import { InitialDashboardData } from "@/types/dashboard";
import { TrendingUp, Package, Recycle, CheckCircle2 } from "lucide-react";

export function MotulDashboard() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [dashboardData, setDashboardData] = useState<InitialDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const data = await DashboardService.getInitialDashboardData(selectedYear);
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching initial dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [selectedYear]);

  const kpi = dashboardData?.kpi || {
    totalCollectedVolumeKg: 0,
    totalStockpileVolumeKg: 0,
    totalRecycledVolumeKg: 0,
  };

  return (
    <div className="space-y-6">
      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryMetricCard
          title="Tổng khối lượng đã thu gom"
          value={
            isLoading
              ? "..."
              : `${kpi.totalCollectedVolumeKg.toLocaleString("vi-VN")} kg`
          }
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <SummaryMetricCard
          title="Tổng khối lượng tồn kho"
          value={
            isLoading
              ? "..."
              : `${kpi.totalStockpileVolumeKg.toLocaleString("vi-VN")} kg`
          }
          icon={<Package className="w-5 h-5" />}
        />
        <SummaryMetricCard
          title="Tổng khối lượng tái chế"
          value={
            isLoading
              ? "..."
              : `${kpi.totalRecycledVolumeKg.toLocaleString("vi-VN")} kg`
          }
          icon={<Recycle className="w-5 h-5" />}
        />
      </div>

      {/* Charts - Each on its own line */}
      <div className="space-y-6">
        {/* Monthly Collection Chart */}
        <MonthlyCollectionChart
          initialData={dashboardData?.monthlyCollectionByOwner}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />

        {/* Waste Source Distribution Chart */}
        <WasteSourceDistributionChart
          initialData={dashboardData?.wasteSourceDistribution}
        />

        {/* Waste Type Trends Chart */}
        <WasteTypeTrendsChart
          initialData={dashboardData?.wasteTypeTrends}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      </div>
    </div>
  );
}
