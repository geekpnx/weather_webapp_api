import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapComponentProps } from '../types/types';
import '../../../backend/static/css/MapComponent.css'
import pinIcon from '../../../backend/static/images/pin/pin-icon.svg'


const defaultIcon = L.icon({
  iconUrl: pinIcon,
  iconSize: [40, 40],
  iconAnchor: [15, 40],
  popupAnchor: [2, -50],

});


const MapComponent: React.FC<MapComponentProps> = ({
  lat,
  lon,
  zoom,
  boundary,
  layer,
  apiKey,
  onLayerChange,
}) => {
  const [showLayerControls, setShowLayerControls] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  // Refs for map layers
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const weatherLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
  const boundaryPolygonRef = useRef<L.Polygon | null>(null);

  const layerOptions = [
    { value: 'temp_new', label: 'Temperature' },
    { value: 'wind_new', label: 'Wind' },
    { value: 'clouds_new', label: 'Clouds' },
    { value: 'precipitation_new', label: 'Precipitation' },
  ];



  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Initialize map
    leafletMapRef.current = L.map(mapRef.current).setView([lat, lon], zoom);
    
    // Base OSM layer
    baseLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      // attribution: '© OpenStreetMap contributors',
      opacity: 0.8,
    }).addTo(leafletMapRef.current);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current) return;

    // Update map view
    leafletMapRef.current.setView([lat, lon], zoom);

    // Update marker
    if (markerRef.current) {
      leafletMapRef.current.removeLayer(markerRef.current);
    }
    markerRef.current = L.marker([lat, lon], { icon: defaultIcon })
      .bindPopup('Your Location')
      .addTo(leafletMapRef.current);

    // Update weather layer
    if (weatherLayerRef.current) {
      leafletMapRef.current.removeLayer(weatherLayerRef.current);
    }
    if (layer && apiKey) {
      const owmUrl = `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${apiKey}`;
      weatherLayerRef.current = L.tileLayer(owmUrl, {
        // attribution: '© OpenWeatherMap',
        opacity: 3,
      }).addTo(leafletMapRef.current);
    }

    // Update image overlay
    if (imageOverlayRef.current) {
      leafletMapRef.current.removeLayer(imageOverlayRef.current);
    }

    // Update boundary polygon
    if (boundaryPolygonRef.current) {
      leafletMapRef.current.removeLayer(boundaryPolygonRef.current);
    }
    if (boundary.length > 0) {
      boundaryPolygonRef.current = L.polygon(boundary, {
        color: 'orange',
        fillOpacity: 0.15,
      }).addTo(leafletMapRef.current);
    }
  }, [lat, lon, zoom, layer, apiKey, boundary]);

  return (
    <div ref={mapRef} className="map-container">
      <div className="layer-controls">
        <button 
          className="layer-toggle"
          onClick={() => setShowLayerControls(!showLayerControls)}
        >
          Layers ▾
        </button>
        
        {showLayerControls && (
          <div className="layer-dropdown">
            {layerOptions.map((option) => (
              <button
                key={option.value}
                className={layer === option.value ? 'active' : ''}
                onClick={() => {
                  onLayerChange(option.value);
                  setShowLayerControls(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;