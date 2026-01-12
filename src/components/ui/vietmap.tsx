"use client";

import { useEffect, useRef, useState } from "react";
import { Map } from "@vietmap/vietmap-gl-js/src/ui/map";
import { Marker } from "@vietmap/vietmap-gl-js/src/ui/marker";
import { Popup } from "@vietmap/vietmap-gl-js/src/ui/popup";
import { LngLatBounds } from "@vietmap/vietmap-gl-js/src/geo/lng_lat_bounds";
import "@vietmap/vietmap-gl-js/dist/vietmap-gl.css";

export interface Coordinate {
  longitude: number;
  latitude: number;
  label?: string; // Optional label for the marker
}

interface VietMapProps {
  // Single coordinate mode (for backward compatibility)
  longitude?: number;
  latitude?: number;
  // Multiple coordinates mode
  coordinates?: Coordinate[];
  zoom?: number;
  width?: string;
  height?: string;
  className?: string;
  draggable?: boolean;
  onMarkerDragEnd?: (lng: number, lat: number, index?: number) => void;
  // Show fit bounds for multiple coordinates
  fitBounds?: boolean;
  // Padding around bounds when fitting
  boundsPadding?: number;
}

export function VietMap({
  longitude,
  latitude,
  coordinates,
  zoom = 13,
  width = "100%",
  height = "400px",
  className = "",
  draggable = false,
  onMarkerDragEnd,
  fitBounds = true,
  boundsPadding = 50,
}: VietMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Determine which mode to use (single coordinate or list)
  const hasCoordinates = coordinates && coordinates.length > 0;
  const hasSingleCoordinate = longitude !== undefined && latitude !== undefined;
  const coordsToUse: Coordinate[] = hasCoordinates
    ? coordinates
    : hasSingleCoordinate
      ? [{ longitude, latitude }]
      : [];

  useEffect(() => {
    if (!mapContainer.current) return;

    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY;
    if (!apiKey) {
      console.error(
        "NEXT_PUBLIC_VIETMAP_API_KEY is not set in environment variables",
      );
      return;
    }

    // Use first coordinate as center, or average if multiple
    const centerLng =
      coordsToUse.length > 0
        ? coordsToUse.reduce((sum, coord) => sum + coord.longitude, 0) /
          coordsToUse.length
        : 106.6297;
    const centerLat =
      coordsToUse.length > 0
        ? coordsToUse.reduce((sum, coord) => sum + coord.latitude, 0) /
          coordsToUse.length
        : 10.8231;

    // Initialize map
    const map = new Map({
      container: mapContainer.current,
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${apiKey}`,
      center: [centerLng, centerLat], // [lng, lat]
      zoom: zoom,
    });

    mapRef.current = map;

    // Wait for map to load before adding markers
    map.on("load", () => {
      setIsMapLoaded(true);

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add markers only if we have coordinates
      if (coordsToUse.length > 0) {
        coordsToUse.forEach((coord, index) => {
          const marker = new Marker({
            draggable: draggable && coordsToUse.length === 1, // Only allow drag for single marker
            color: "#ef4444", // Red color for the marker
          })
            .setLngLat([coord.longitude, coord.latitude])
            .addTo(map);

          // Add popup with label if available
          if (coord.label) {
            const popup = new Popup({ offset: 25 }).setText(coord.label);
            marker.setPopup(popup);
          }

          markersRef.current.push(marker);

          // Handle marker drag end event
          if (draggable && onMarkerDragEnd && coordsToUse.length === 1) {
            marker.on("dragend", () => {
              const lngLat = marker.getLngLat();
              onMarkerDragEnd(lngLat.lng, lngLat.lat, index);
            });
          }
        });

        // Fit bounds if multiple coordinates and fitBounds is enabled
        if (coordsToUse.length > 1 && fitBounds) {
          const bounds = new LngLatBounds();
          coordsToUse.forEach((coord) => {
            bounds.extend([coord.longitude, coord.latitude]);
          });
          map.fitBounds(bounds, {
            padding: boundsPadding,
          });
        }
      }
    });

    // Cleanup function
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []); // Only run once on mount

  // Update markers when coordinates change
  useEffect(() => {
    if (isMapLoaded && mapRef.current) {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add new markers
      if (coordsToUse.length > 0) {
        coordsToUse.forEach((coord, index) => {
          const marker = new Marker({
            draggable: draggable && coordsToUse.length === 1,
            color: "#ef4444",
          })
            .setLngLat([coord.longitude, coord.latitude])
            .addTo(mapRef.current!);

          if (coord.label) {
            const popup = new Popup({ offset: 25 }).setText(coord.label);
            marker.setPopup(popup);
          }

          markersRef.current.push(marker);

          if (draggable && onMarkerDragEnd && coordsToUse.length === 1) {
            marker.on("dragend", () => {
              const lngLat = marker.getLngLat();
              onMarkerDragEnd(lngLat.lng, lngLat.lat, index);
            });
          }
        });

        // Update center for single coordinate
        if (coordsToUse.length === 1) {
          mapRef.current.setCenter([
            coordsToUse[0].longitude,
            coordsToUse[0].latitude,
          ]);
        }

        // Fit bounds for multiple coordinates
        if (coordsToUse.length > 1 && fitBounds) {
          const bounds = new LngLatBounds();
          coordsToUse.forEach((coord) => {
            bounds.extend([coord.longitude, coord.latitude]);
          });
          mapRef.current.fitBounds(bounds, {
            padding: boundsPadding,
          });
        }
      }
    }
  }, [
    coordinates,
    longitude,
    latitude,
    isMapLoaded,
    draggable,
    fitBounds,
    boundsPadding,
    onMarkerDragEnd,
  ]);

  // Update zoom when zoom prop changes
  useEffect(() => {
    if (isMapLoaded && mapRef.current) {
      mapRef.current.setZoom(zoom);
    }
  }, [zoom, isMapLoaded]);

  if (coordsToUse.length === 0) {
    return (
      <div
        style={{ width, height }}
        className={`flex items-center justify-center bg-gray-100 border-2 border-gray-300 rounded-lg ${className}`}
      >
        <p className="text-sm text-muted-foreground">
          Chọn địa chỉ để hiển thị bản đồ
        </p>
      </div>
    );
  }

  return (
    <div ref={mapContainer} style={{ width, height }} className={className} />
  );
}
