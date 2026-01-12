import { BatchType } from "./batch";

// 1. Batch Analysis (Port vs Factory)
export interface BatchAnalysisMetrics {
  batchType: BatchType.PORT | BatchType.FACTORY;
  totalRecycledVolumeKg: number;
  collectedVolumeKg: number;
  stockpileVolumeKg: number;
  batchCount: number;
}

export interface BatchAnalysisData {
  period: string; // 'YYYY-MM' or 'all'
  port: BatchAnalysisMetrics;
  factory: BatchAnalysisMetrics;
  total: {
    totalRecycledVolumeKg: number;
    collectedVolumeKg: number;
    stockpileVolumeKg: number;
    batchCount: number;
  };
}

export interface BatchAnalysisResponse {
  success: boolean;
  data: BatchAnalysisData;
}

export interface BatchAnalysisFilters {
  year?: number;
  month?: number; // 1-12
}

// 2. Price Analysis with FS and DO
export interface PriceFsAnalysisInput {
  fsValue: number; // FS (Functional Specification) value from admin
  doValue: number; // DO (Dissolved Oxygen) value from admin
  year?: number;
  month?: number;
}

export interface PriceStatistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  count: number;
}

export interface FsComparison {
  inputFsValue: number;
  priceStats: PriceStatistics;
  comparison: {
    belowFs: {
      count: number;
      percentage: number;
      avgPrice: number;
    };
    atFs: {
      count: number;
      percentage: number;
    };
    aboveFs: {
      count: number;
      percentage: number;
      avgPrice: number;
    };
  };
}

export interface DoCorrelation {
  inputDoValue: number;
  priceStats: PriceStatistics;
  correlation: {
    coefficient: number; // Correlation coefficient (-1 to 1)
    strength: string; // 'strong' | 'moderate' | 'weak' | 'none'
    direction: string; // 'positive' | 'negative' | 'none'
  };
  fluctuations: Array<{
    doRange: string;
    avgPrice: number;
    volumeKg: number;
    recordCount: number;
  }>;
}

export interface PriceFsAnalysisData {
  period: string;
  fsComparison: FsComparison;
  doCorrelation: DoCorrelation;
  overallStats: PriceStatistics;
}

export interface PriceFsAnalysisResponse {
  success: boolean;
  data: PriceFsAnalysisData;
}

// 3. Price Zone Analysis
export interface PriceZone {
  zoneId: number;
  priceRangeMin: number;
  priceRangeMax: number;
  priceRangeLabel: string; // e.g., "1,000 - 2,000 VND/kg"
  totalCollectedVolumeKg: number;
  totalRecycledVolumeKg: number;
  recordCount: number;
  percentage: number; // Percentage of total volume
  rank: number;
  avgPrice: number;
}

export interface PriceZoneAnalysisData {
  period: string;
  totalVolumeKg: number;
  zones: PriceZone[];
  topZones: PriceZone[]; // Top 3-5 zones by volume
  insights: {
    mostPopularZone: PriceZone;
    highestVolumeZone: PriceZone;
    priceRange: {
      min: number;
      max: number;
    };
  };
}

export interface PriceZoneAnalysisResponse {
  success: boolean;
  data: PriceZoneAnalysisData;
}

export interface PriceZoneFilters {
  year?: number;
  month?: number;
  zoneSize?: number; // Price range size for zones (default: 500 VND)
}

// Query Parameters
export interface AnalyticsDateFilters {
  year?: number;
  month?: number; // 1-12
  startDate?: string; // 'YYYY-MM-DD'
  endDate?: string; // 'YYYY-MM-DD'
}

// Helper Types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface PeriodLabel {
  year: number;
  month?: number;
  label: string; // 'All Time' | 'June 2025' | '2025'
}
