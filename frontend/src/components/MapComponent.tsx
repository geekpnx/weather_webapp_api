// MapComponent.tsx
import React, { useEffect, useRef } from 'react';
import { MapComponentProps } from '../types/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define the default Leaflet icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41], // size of the icon
  iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
  popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const MapComponent: React.FC<MapComponentProps> = ({ lat, lon, zoom, layer, apiKey }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  // Keep references to each layer so we can remove/update them when needed
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const overlayRef   = useRef<L.TileLayer | null>(null);

  // (1) Store a reference to the marker to avoid stacking on re-renders
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // 1) If the map doesn't exist yet, create it
    if (mapRef.current && !leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([lat, lon], zoom);
    }

    // 2) If the map already exists, just update the view
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([lat, lon], zoom);

      // 3) Create the base (OSM) layer if not already created
      if (!baseLayerRef.current) {
        baseLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          opacity: 0.8,
        });
        baseLayerRef.current.addTo(leafletMapRef.current);
      }

      // (1) Remove any existing marker before adding a new one
      if (markerRef.current) {
        leafletMapRef.current.removeLayer(markerRef.current);
      }

      // (1) Create a new marker at [lat, lon] and store it in markerRef
      markerRef.current = L.marker([lat, lon], { icon: defaultIcon })
        .bindPopup('Your Location');
      // (2) We do NOT call .openPopup(), so it only opens on user click
      markerRef.current.addTo(leafletMapRef.current);

      // 4) Remove any old overlay (e.g. temperature/wind layer) if present
      if (overlayRef.current) {
        leafletMapRef.current.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }

      // 5) Add the new OpenWeatherMap overlay layer with partial opacity
      const owmUrl = `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${apiKey}`;
      overlayRef.current = L.tileLayer(owmUrl, {
        attribution: '© OpenWeatherMap',
        opacity: 1, // set to 0.6 for partial transparency
      });
      overlayRef.current.addTo(leafletMapRef.current);
    }
  }, [lat, lon, zoom, layer, apiKey]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '400px', borderRadius: '10px' }}
    />
  );
};

export default MapComponent;
