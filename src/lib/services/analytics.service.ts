import { api } from "@/lib/axios";
import { path, ENDPOINTS } from "@/constants/api";
import {
  BatchAnalysisFilters,
  BatchAnalysisData,
  PriceFsAnalysisInput,
  PriceFsAnalysisData,
  PriceZoneFilters,
  PriceZoneAnalysisData,
} from "@/types/analytics";

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

export const AnalyticsService = {
  /**
   * Get batch analysis comparing port vs factory performance
   * GET /api/analytics/batch-analysis?year=2025&month=6
   */
  async getBatchAnalysis(
    filters: BatchAnalysisFilters,
  ): Promise<BatchAnalysisData> {
    const queryParams = new URLSearchParams();
    if (filters.year) {
      queryParams.append("year", filters.year.toString());
    }
    if (filters.month) {
      queryParams.append("month", filters.month.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `${ENDPOINTS.ANALYTICS.BATCH_ANALYSIS}?${queryString}`
      : ENDPOINTS.ANALYTICS.BATCH_ANALYSIS;

    const { data } = await api.get(path.analytics(url));
    const result = data.data || data;
    return toCamelCase(result) as BatchAnalysisData;
  },

  /**
   * Analyze price with FS and DO parameters
   * POST /api/analytics/price-fs-analysis
   */
  async getPriceFsAnalysis(
    input: PriceFsAnalysisInput,
  ): Promise<PriceFsAnalysisData> {
    const { data } = await api.post(
      path.analytics(ENDPOINTS.ANALYTICS.PRICE_FS_ANALYSIS),
      input,
    );
    const result = data.data || data;
    return toCamelCase(result) as PriceFsAnalysisData;
  },

  /**
   * Get price zone analysis ranked by collected volume
   * GET /api/analytics/price-zones?year=2025&month=6&zoneSize=500
   */
  async getPriceZoneAnalysis(
    filters: PriceZoneFilters,
  ): Promise<PriceZoneAnalysisData> {
    const queryParams = new URLSearchParams();
    if (filters.year) {
      queryParams.append("year", filters.year.toString());
    }
    if (filters.month) {
      queryParams.append("month", filters.month.toString());
    }
    if (filters.zoneSize) {
      queryParams.append("zoneSize", filters.zoneSize.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `${ENDPOINTS.ANALYTICS.PRICE_ZONES}?${queryString}`
      : ENDPOINTS.ANALYTICS.PRICE_ZONES;

    const { data } = await api.get(path.analytics(url));
    const result = data.data || data;
    return toCamelCase(result) as PriceZoneAnalysisData;
  },
};
