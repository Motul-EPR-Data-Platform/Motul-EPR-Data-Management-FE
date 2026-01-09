export interface CollectionDashboardStats {
  totalCollectedVolumeKg: number;
  totalStockpileVolumeKg: number;
  totalRecycledVolumeKg: number;
}

export interface CollectionDashboardResponse {
  success: boolean;
  data: CollectionDashboardStats;
}

export interface InitialDashboardData {
  kpi: CollectionDashboardStats;
  monthlyCollectionByOwner: MonthlyCollectionData;
  wasteSourceDistribution: WasteSourceDistribution;
  wasteTypeTrends: WasteTypeTrendData;
}

export interface InitialDashboardResponse {
  success: boolean;
  data: InitialDashboardData;
}

// Bar Chart: Monthly Collection by waste owner
export interface MonthlyCollectionDataPoint {
  month: number; // 1-12
  collectedVolumeKg: number;
}

export interface MonthlyCollectionData {
  year: number;
  wasteOwnerId: string | null; // null means "all"
  monthlyData: number[]; // 12 values, one per month
}

export interface MonthlyCollectionResponse {
  success: boolean;
  data: MonthlyCollectionData;
}

// Horizontal Bar Chart: Waste Source Distribution
export interface WasteSourceDistributionItem {
  wasteSourceId: string;
  wasteSourceName: string;
  volumeKg: number;
  percentage: number;
}

export interface WasteSourceDistribution {
  period: string; // 'all' | '2025-06' | '2025'
  totalVolumeKg: number;
  distribution: WasteSourceDistributionItem[];
}

export interface WasteSourceDistributionResponse {
  success: boolean;
  data: WasteSourceDistribution;
}

// Multi-line Chart: Waste Type Trends (Price)
export interface WasteTypePriceDataPoint {
  month: number; // 1-12
  avgPricePerKg: number;
}

export interface WasteTypeTrendData {
  year: number;
  wasteSourceIds: string[];
  trends: {
    [wasteSourceId: string]: {
      wasteSourceName: string;
      monthlyPrices: number[]; // 12 values, one per month
    };
  };
}

export interface WasteTypeTrendResponse {
  success: boolean;
  data: WasteTypeTrendData;
}

// Query Parameters
export interface DashboardFilters {
  recyclerId?: string;
  submissionMonthStart?: string; // 'YYYY-MM-DD'
  submissionMonthEnd?: string; // 'YYYY-MM-DD'
  status?: string;
  wasteSourceId?: string;
  hazWasteId?: string;
  contractTypeId?: string;
  batchId?: string;
}

export interface MonthlyCollectionFilters {
  year: number;
  wasteOwnerId?: string | null;
}

export interface WasteSourceDistributionFilters {
  period?: string; // 'all' | 'YYYY-MM' | 'YYYY'
}

export interface WasteTypeTrendFilters {
  year: number;
  wasteSourceIds: string[]; // Max 4
}

