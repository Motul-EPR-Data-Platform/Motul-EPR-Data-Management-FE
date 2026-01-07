"use client";

import { useState, useEffect } from "react";
import { SummaryMetricCard } from "./SummaryMetricCard";
import { MonthlyCollectionChart } from "./MonthlyCollectionChart";
import { WasteSourceDistributionChart } from "./WasteSourceDistributionChart";
import { WasteTypeTrendsChart } from "./WasteTypeTrendsChart";
import { DashboardService } from "@/lib/services/dashboard.service";
import { TrendingUp, Package, Recycle } from "lucide-react";
import { Loader2 } from "lucide-react";

export function RecyclerDashboard() {
  const [kpi, setKpi] = useState({
    totalCollectedVolumeKg: 0,
    totalStockpileVolumeKg: 0,
    totalRecycledVolumeKg: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchKPI = async () => {
      setIsLoading(true);
      try {
        const data = await DashboardService.getCollectionDashboardStats();
        setKpi(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKPI();
  }, []);

  return (
    <div className="space-y-6">
      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection Chart */}
        <MonthlyCollectionChart />

        {/* Waste Source Distribution Chart */}
        <WasteSourceDistributionChart />
      </div>

      {/* Waste Type Trends Chart - Full Width */}
      <div className="grid grid-cols-1 gap-6">
        <WasteTypeTrendsChart />
      </div>
    </div>
  );
}

