"use client";

import { useEffect, useRef, useState } from "react";
import { Map, Marker } from "@vietmap/vietmap-gl-js";
import "@vietmap/vietmap-gl-js/dist/vietmap-gl.css";

interface VietMapProps {
  longitude: number;
  latitude: number;
  zoom?: number;
  width?: string;
  height?: string;
  className?: string;
  draggable?: boolean;
  onMarkerDragEnd?: (lng: number, lat: number) => void;
}

export function VietMap({
  longitude,
  latitude,
  zoom = 13,
  width = "100%",
  height = "400px",
  className = "",
  draggable = false,
  onMarkerDragEnd,
}: VietMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Get API key from environment variable
    // Note: In Next.js, client-side env vars must be prefixed with NEXT_PUBLIC_
    // Make sure you have NEXT_PUBLIC_VIETMAP_API_KEY in your .env.local file
    const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY;
    if (!apiKey) {
      console.error(
        "NEXT_PUBLIC_VIETMAP_API_KEY is not set in environment variables",
      );
      return;
    }

    // Initialize map
    const map = new Map({
      container: mapContainer.current,
      style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${apiKey}`,
      center: [longitude, latitude], // [lng, lat]
      zoom: zoom,
    });

    mapRef.current = map;

    // Wait for map to load before adding marker
    map.on("load", () => {
      setIsMapLoaded(true);

      // Create and add marker
      const marker = new Marker({
        draggable: draggable,
        color: "#ef4444", // Red color for the marker
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      markerRef.current = marker;

      // Handle marker drag end event
      if (draggable && onMarkerDragEnd) {
        marker.on("dragend", () => {
          const lngLat = marker.getLngLat();
          onMarkerDragEnd(lngLat.lng, lngLat.lat);
        });
      }
    });

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []); // Only run once on mount

  // Update marker position when longitude/latitude changes
  useEffect(() => {
    if (isMapLoaded && markerRef.current && mapRef.current) {
      markerRef.current.setLngLat([longitude, latitude]);
      mapRef.current.setCenter([longitude, latitude]);
    }
  }, [longitude, latitude, isMapLoaded]);

  // Update zoom when zoom prop changes
  useEffect(() => {
    if (isMapLoaded && mapRef.current) {
      mapRef.current.setZoom(zoom);
    }
  }, [zoom, isMapLoaded]);

  // Update draggable state
  useEffect(() => {
    if (isMapLoaded && markerRef.current) {
      markerRef.current.setDraggable(draggable);
    }
  }, [draggable, isMapLoaded]);

  return (
    <div ref={mapContainer} style={{ width, height }} className={className} />
  );
}
