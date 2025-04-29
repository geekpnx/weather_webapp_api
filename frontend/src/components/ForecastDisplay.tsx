import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../assets/css/ForecastDisplay.css';
import { ForecastItem } from '../types/types';
import { usePreferences } from '../context/PreferencesContext';

const OPENWEATHER_URL = import.meta.env.VITE_OPENWEATHERMAP_BASE_URL;
interface ForecastDisplayProps {
  data: ForecastItem[];
}

const ForecastDisplay: React.FC<ForecastDisplayProps> = ({ data }) => {
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { temperatureUnit } = usePreferences();
  const { convertTemp } = usePreferences(); 

  // Initialize tab refs array
  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, data.length);
  }, [data]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (datetime: string): string => {
    return new Date(datetime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatTemperature = (temp: number) => {
    const convertedTemp = convertTemp(temp);
    return `${Math.round(convertedTemp)}°`;
  };

  // Convert wind speed based on unit (m/s for metric, mph for imperial)
  const formatWindSpeed = (speed: number) => {
    return temperatureUnit === 'F' 
      ? `${(speed * 2.237).toFixed(1)} mph` // Convert m/s to mph
      : `${speed} m/s`;
  };

  // Handle click outside to close expanded card
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedRef.current && !expandedRef.current.contains(event.target as Node)) {
        setExpandedDayIndex(null);
      }
    };

    if (expandedDayIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedDayIndex]);

  // Calculate popup position based on active tab
  const getPopupStyle = useCallback(() => {
    if (expandedDayIndex !== null && tabRefs.current[expandedDayIndex]) {
      const tab = tabRefs.current[expandedDayIndex];
      if (tab) {
        const tabRect = tab.getBoundingClientRect();
        const containerRect = tab.parentElement?.getBoundingClientRect();
        if (containerRect) {
          const arrowPos = (tabRect.left + tabRect.width / 2) - containerRect.left;
          return {
            '--arrow-pos': `${arrowPos}px`
          } as React.CSSProperties;
        }
      }
    }
    return {};
  }, [expandedDayIndex]);

  // Proper ref callback function
  const setTabRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    tabRefs.current[index] = el;
  }, []);

  return (
    <div className="forecast-container">
      <div className="forecast-tabs">
        {data.map((day, index) => {
          const maxTemp = Math.max(...day.forecasts.map(f => f.temp_max));
          const minTemp = Math.min(...day.forecasts.map(f => f.temp_min));
          const firstForecast = day.forecasts[0];
          return (
            <div
              key={index}
              ref={setTabRef(index)}
              className={`forecast-tab ${index === expandedDayIndex ? 'active' : ''}`}
              onClick={() => setExpandedDayIndex(index === expandedDayIndex ? null : index)}
            >
              <div className="tab-day">{day.day_name}</div>
              <div className="tab-date">{formatDate(day.date)}</div>
              <img
                src={`${OPENWEATHER_URL}/img/wn/${firstForecast.weather_icon}.png`}
                alt={firstForecast.weather_description}
                width={40}
                loading="lazy"
              />
              <div className="tab-temp">{formatTemperature(firstForecast.temperature)}</div>
              <div className="tab-high-low">
                <span>H: {formatTemperature(maxTemp)}</span>
                <span>L: {formatTemperature(minTemp)}</span>
              </div>
            </div>
          );
        })}
      </div>
      {expandedDayIndex !== null && (
        <div 
          className="forecast-expanded" 
          ref={expandedRef}
          style={getPopupStyle()}
        >
          <div className="day-additional-info">
            <p><strong>UV Index:</strong> {data[expandedDayIndex].uv_index}</p>
            <p><strong>Sunrise:</strong> {data[expandedDayIndex].sunrise}</p>
            <p><strong>Sunset:</strong> {data[expandedDayIndex].sunset}</p>
          </div>
          <div className="hourly-forecasts">
            {data[expandedDayIndex].forecasts.map((hourly, idx) => (
              <div key={idx} className="hourly-item">
                <p className="hourly-time">{formatTime(hourly.datetime)}</p>
                <img
                  src={`${OPENWEATHER_URL}/img/wn/${hourly.weather_icon}.png`}
                  alt={hourly.weather_description}
                  width={50}
                />
                <p>{formatTemperature(hourly.temperature)}</p>
                <div className="hourly-details">
                  <p>Feels Like: {formatTemperature(hourly.feels_like)}</p>
                  <p>Humidity: {hourly.humidity}%</p>
                  <p>Wind: {formatWindSpeed(hourly.wind_speed)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastDisplay;