import { api } from "@/lib/axios";
import { ENDPOINTS } from "@/constants/api";
import {
  VietmapAutocompleteResult,
  LocationData,
} from "@/types/location";

export const LocationService = {
  /**
   * Search address autocomplete
   * GET /api/locations/autocomplete?query=...
   */
  async searchAddress(
    query: string,
  ): Promise<VietmapAutocompleteResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const queryParams = new URLSearchParams({ query });
    const url = `${ENDPOINTS.LOCATIONS.ROOT}${ENDPOINTS.LOCATIONS.AUTOCOMPLETE}?${queryParams.toString()}`;
    try {
      const { data } = await api.get(url);
      return data.data || [];
    } catch (error: any) {
      console.error("Location search error:", {
        url,
        status: error?.response?.status,
        message: error?.message,
      });
      throw error;
    }
  },

  /**
   * Get location details by refId
   * GET /api/locations/:refId
   */
  async getLocationByRefId(refId: string): Promise<LocationData> {
    const url = `${ENDPOINTS.LOCATIONS.ROOT}${ENDPOINTS.LOCATIONS.BY_REF_ID(refId)}`;
    const { data } = await api.get(url);
    return data.data || data;
  },
};

