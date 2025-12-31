/**
 * Centralized mock data for dashboard
 * TODO: Replace with real API calls when backend is ready
 * To remove: Delete this entire file and update imports in dashboard components
 */

// Summary metrics
export interface DashboardMetrics {
  totalCollectedVolumeKg: number;
  totalRecycledVolumeKg: number;
  approvedRecords: number;
  totalRecords: number;
  collectedVolumeChangePercent?: number;
  totalRecordsChangeCount?: number;
}

export const mockDashboardMetrics: DashboardMetrics = {
  totalCollectedVolumeKg: 430,
  totalRecycledVolumeKg: 1,
  approvedRecords: 1,
  totalRecords: 2,
  collectedVolumeChangePercent: 12.5,
  totalRecordsChangeCount: 8,
};

// Time series data for line chart
export interface TimeSeriesDataPoint {
  month: string;
  [key: string]: string | number; // Dynamic keys for different series (e.g., "WTP 1", "WTP 2", etc.)
}

export const mockRecordsOverTime: TimeSeriesDataPoint[] = [
  { month: "Jul", "WTP 1": 50, "WTP 2": 30, "WTP 3": 40, "WTP 4": 20, "WTP 5": 35 },
  { month: "Aug", "WTP 1": 65, "WTP 2": 45, "WTP 3": 55, "WTP 4": 30, "WTP 5": 42 },
  { month: "Sep", "WTP 1": 80, "WTP 2": 60, "WTP 3": 70, "WTP 4": 45, "WTP 5": 55 },
  { month: "Oct", "WTP 1": 95, "WTP 2": 75, "WTP 3": 85, "WTP 4": 60, "WTP 5": 70 },
  { month: "Nov", "WTP 1": 70, "WTP 2": 50, "WTP 3": 60, "WTP 4": 35, "WTP 5": 45 },
];

// Volume by Waste Owner data structure
export interface WasteOwnerVolumeData {
  wasteOwnerId: string;
  wasteOwnerName: string;
  monthlyData: {
    month: string;
    volumeKg: number;
  }[];
}

// Mock waste owners for dropdown
export interface MockWasteOwner {
  id: string;
  name: string;
}

export const mockWasteOwners: MockWasteOwner[] = [
  { id: "all", name: "Tất cả" },
  { id: "wo1", name: "Công ty A" },
  { id: "wo2", name: "Công ty B" },
  { id: "wo3", name: "Công ty C" },
];

// Mock volume data by waste owner for all months in a year
export const mockVolumeByWasteOwner: Record<string, WasteOwnerVolumeData> = {
  wo1: {
    wasteOwnerId: "wo1",
    wasteOwnerName: "Công ty A",
    monthlyData: [
      { month: "Tháng 1", volumeKg: 300 },
      { month: "Tháng 2", volumeKg: 350 },
      { month: "Tháng 3", volumeKg: 400 },
      { month: "Tháng 4", volumeKg: 380 },
      { month: "Tháng 5", volumeKg: 420 },
      { month: "Tháng 6", volumeKg: 450 },
      { month: "Tháng 7", volumeKg: 400 },
      { month: "Tháng 8", volumeKg: 580 },
      { month: "Tháng 9", volumeKg: 600 },
      { month: "Tháng 10", volumeKg: 550 },
      { month: "Tháng 11", volumeKg: 480 },
      { month: "Tháng 12", volumeKg: 520 },
    ],
  },
  wo2: {
    wasteOwnerId: "wo2",
    wasteOwnerName: "Công ty B",
    monthlyData: [
      { month: "Tháng 1", volumeKg: 200 },
      { month: "Tháng 2", volumeKg: 250 },
      { month: "Tháng 3", volumeKg: 280 },
      { month: "Tháng 4", volumeKg: 300 },
      { month: "Tháng 5", volumeKg: 320 },
      { month: "Tháng 6", volumeKg: 350 },
      { month: "Tháng 7", volumeKg: 300 },
      { month: "Tháng 8", volumeKg: 400 },
      { month: "Tháng 9", volumeKg: 450 },
      { month: "Tháng 10", volumeKg: 400 },
      { month: "Tháng 11", volumeKg: 350 },
      { month: "Tháng 12", volumeKg: 380 },
    ],
  },
  wo3: {
    wasteOwnerId: "wo3",
    wasteOwnerName: "Công ty C",
    monthlyData: [
      { month: "Tháng 1", volumeKg: 150 },
      { month: "Tháng 2", volumeKg: 180 },
      { month: "Tháng 3", volumeKg: 200 },
      { month: "Tháng 4", volumeKg: 220 },
      { month: "Tháng 5", volumeKg: 250 },
      { month: "Tháng 6", volumeKg: 280 },
      { month: "Tháng 7", volumeKg: 250 },
      { month: "Tháng 8", volumeKg: 350 },
      { month: "Tháng 9", volumeKg: 400 },
      { month: "Tháng 10", volumeKg: 380 },
      { month: "Tháng 11", volumeKg: 320 },
      { month: "Tháng 12", volumeKg: 350 },
    ],
  },
};

// Helper function to get volume data for a specific year and waste owner
export function getVolumeByWasteOwnerData(
  year: number,
  wasteOwnerId: string | null,
): { month: string; value: number }[] {
  if (wasteOwnerId === "all" || !wasteOwnerId) {
    // Sum all waste owners for each month
    const allMonths = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    return allMonths.map((month) => {
      const totalVolume = Object.values(mockVolumeByWasteOwner).reduce(
        (sum, woData) => {
          const monthData = woData.monthlyData.find((d) => d.month === month);
          return sum + (monthData?.volumeKg || 0);
        },
        0,
      );
      return { month, value: totalVolume };
    });
  }

  // Get data for specific waste owner
  const wasteOwnerData = mockVolumeByWasteOwner[wasteOwnerId];
  if (!wasteOwnerData) {
    return [];
  }

  return wasteOwnerData.monthlyData.map((d) => ({
    month: d.month,
    value: d.volumeKg,
  }));
}

// Bar chart data (deprecated - use getVolumeByWasteOwnerData instead)
export interface BarChartDataPoint {
  [key: string]: string | number;
  month: string;
  value: number;
}

export const mockVolumeByRecyclingUnit: BarChartDataPoint[] = [
  { month: "Jul", value: 400 },
  { month: "Aug", value: 580 },
  { month: "Sep", value: 750 },
  { month: "Oct", value: 950 },
  { month: "Nov", value: 280 },
];

// Pie chart data
export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export const mockWasteSourceClassification: PieChartDataPoint[] = [
  { name: "Nguồn 1", value: 35, color: "#e2231a" },
  { name: "Nguồn 2", value: 25, color: "#22c55e" },
  { name: "Nguồn 3", value: 20, color: "#f97316" },
  { name: "Nguồn 4", value: 15, color: "#6b7280" },
  { name: "Nguồn 5", value: 5, color: "#000000" },
];

// Chart colors
export const chartColors = {
  primary: "#e2231a", // Motul red
  green: "#22c55e",
  orange: "#f97316",
  gray: "#6b7280",
  black: "#000000",
  blue: "#3b82f6",
  purple: "#a855f7",
  yellow: "#eab308",
};

// Line chart series colors (for multiple lines)
export const lineChartColors = [
  chartColors.green,
  chartColors.orange,
  chartColors.primary,
  chartColors.black,
  "#8b0000", // Dark red/maroon
];
