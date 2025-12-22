export interface VietmapAutocompleteResult {
  ref_id: string;
  display: string;
  address: string;
}

export interface LocationData {
  code: string; // ref_id
  address: string; // display
  city: string; // city
  latitude: number; // lat
  longitude: number; // lng
}

export interface LocationAutocompleteResponse {
  success: boolean;
  count: number;
  data: VietmapAutocompleteResult[];
}

export interface LocationDetailsResponse {
  success: boolean;
  data: LocationData;
}
