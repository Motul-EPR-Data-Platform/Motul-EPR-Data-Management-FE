// Type declarations for Google Maps JavaScript API

interface Window {
  google?: typeof google;
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(
        mapDiv: Element | null,
        opts?: MapOptions,
      );
      setCenter(latlng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latlng: LatLng | LatLngLiteral | null): void;
      setTitle(title: string | null): void;
      setMap(map: Map | null): void;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map | null;
      title?: string;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
  }
}

// Make google available globally
declare var google: typeof google;
