import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapComponentProps {
  lat: number;
  lon: number;
  zoom: number;
  boundary: [number, number][];
  imageUrl: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ lat, lon, zoom, boundary, imageUrl }) => {
  const mapRef = useRef<L.Map | null>(null);
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([lat, lon], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    if (imageUrl && !imageOverlayRef.current) {
      const bounds = L.latLngBounds([
        [lat - 0.02, lon - 0.02],  // Smaller bounds for faster rendering
        [lat + 0.02, lon + 0.02],
      ]);
      imageOverlayRef.current = L.imageOverlay(imageUrl, bounds).addTo(mapRef.current);
      setIsLoading(false);
    }

    L.marker([lat, lon], { icon: defaultIcon }).addTo(mapRef.current)
      .bindPopup('Your Location')
      .openPopup();

    if (boundary.length > 0) {
      L.polygon(boundary, { color: 'blue', fillOpacity: 0.2 }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lon, zoom, boundary, imageUrl]);

  return (
    <div id="map" style={{ height: '400px', width: '100%', borderRadius: '10px' }}>
      {isLoading && <div className="loading-indicator">Loading map...</div>}
    </div>
  );
};

export default MapComponent;