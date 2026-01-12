"use client";

import { useEffect, useRef, useState } from "react";

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: string;
  height?: string;
  className?: string;
  markerTitle?: string;
}

export function GoogleMap({
  latitude,
  longitude,
  zoom = 15,
  width = "100%",
  height = "400px",
  className = "",
  markerTitle = "Location",
}: GoogleMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;

    if (!apiKey) {
      setLoadError("Google Maps API key is not configured");
      return;
    }

    // Check if script is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]',
    );
    if (existingScript) {
      // Wait for existing script to load
      existingScript.addEventListener("load", () => setIsLoaded(true));
      return;
    }

    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setLoadError("Failed to load Google Maps");
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts (optional)
      // Note: We might want to keep it if other components use it
    };
  }, []);

  // Initialize map and marker
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || !window.google) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
    if (!apiKey) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });
    }

    // Create or update marker
    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapRef.current,
        title: markerTitle,
      });
    } else {
      markerRef.current.setPosition({ lat: latitude, lng: longitude });
      markerRef.current.setTitle(markerTitle);
    }

    // Update map center and zoom
    if (mapRef.current) {
      mapRef.current.setCenter({ lat: latitude, lng: longitude });
      mapRef.current.setZoom(zoom);
    }
  }, [isLoaded, latitude, longitude, zoom, markerTitle]);

  if (loadError) {
    return (
      <div
        style={{ width, height }}
        className={`flex items-center justify-center bg-gray-100 border-2 border-gray-300 rounded-lg ${className}`}
      >
        <p className="text-sm text-red-500">{loadError}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{ width, height }}
        className={`flex items-center justify-center bg-gray-100 border-2 border-gray-300 rounded-lg ${className}`}
      >
        <p className="text-sm text-muted-foreground">Đang tải bản đồ...</p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      style={{ width, height }}
      className={`rounded-lg border-2 border-gray-300 ${className}`}
    />
  );
}
