import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import {
  CollectionDashboardStats,
  CollectionDashboardResponse,
  InitialDashboardData,
  InitialDashboardResponse,
  MonthlyCollectionData,
  MonthlyCollectionResponse,
  MonthlyCollectionFilters,
  WasteSourceDistribution,
  WasteSourceDistributionResponse,
  WasteSourceDistributionFilters,
  WasteTypeTrendData,
  WasteTypeTrendResponse,
  WasteTypeTrendFilters,
} from "@/types/dashboard";

/**
 * Transform snake_case object to camelCase
 */
function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (typeof obj !== "object") {
    return obj;
  }
  const camelObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );
      camelObj[camelKey] = toCamelCase(obj[key]);
    }
  }
  return camelObj;
}

export const DashboardService = {
  /**
   * Get collection dashboard statistics
   * GET /api/dashboard/collection-stats
   */
  async getCollectionDashboardStats(): Promise<CollectionDashboardStats> {
    const { data } = await api.get(
      path.dashboard(ENDPOINTS.DASHBOARD.COLLECTION_STATS),
    );
    const result = data.data || data;
    return toCamelCase(result) as CollectionDashboardStats;
  },

  /**
   * Get all initial dashboard data at once
   * GET /api/dashboard/initial?year=2025
   */
  async getInitialDashboardData(
    year: number,
  ): Promise<InitialDashboardData> {
    const { data } = await api.get(path.dashboard(ENDPOINTS.DASHBOARD.INITIAL), {
      params: { year },
    });
    const result = data.data || data;
    return toCamelCase(result) as InitialDashboardData;
  },

  /**
   * Get monthly collection data by waste owner
   * GET /api/dashboard/collection-by-owner?year=2025&wasteOwnerId=xxx
   */
  async getMonthlyCollectionByOwner(
    filters: MonthlyCollectionFilters,
  ): Promise<MonthlyCollectionData> {
    const { data } = await api.get(
      path.dashboard(ENDPOINTS.DASHBOARD.COLLECTION_BY_OWNER),
      {
        params: {
          year: filters.year,
          wasteOwnerId: filters.wasteOwnerId || undefined,
        },
      },
    );
    const result = data.data || data;
    return toCamelCase(result) as MonthlyCollectionData;
  },

  /**
   * Get waste source distribution
   * GET /api/dashboard/source-distribution?period=2025-06
   */
  async getWasteSourceDistribution(
    filters: WasteSourceDistributionFilters,
  ): Promise<WasteSourceDistribution> {
    const { data } = await api.get(
      path.dashboard(ENDPOINTS.DASHBOARD.SOURCE_DISTRIBUTION),
      {
        params: {
          period: filters.period || "all",
        },
      },
    );
    const result = data.data || data;
    return toCamelCase(result) as WasteSourceDistribution;
  },

  /**
   * Get waste type price trends
   * GET /api/dashboard/waste-type-trends?year=2025&wasteSourceIds=id1,id2,id3
   */
  async getWasteTypeTrends(
    filters: WasteTypeTrendFilters,
  ): Promise<WasteTypeTrendData> {
    const { data } = await api.get(
      path.dashboard(ENDPOINTS.DASHBOARD.WASTE_TYPE_TRENDS),
      {
        params: {
          year: filters.year,
          wasteSourceIds:
            filters.wasteSourceIds.length > 0
              ? filters.wasteSourceIds.join(",")
              : undefined,
        },
      },
    );
    const result = data.data || data;
    return toCamelCase(result) as WasteTypeTrendData;
  },
};

