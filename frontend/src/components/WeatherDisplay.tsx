import React from 'react';
import ForecastDisplay from './ForecastDisplay';
import '../assets/css/WeatherDisplay.css';
import { usePreferences } from '../context/PreferencesContext';



interface WeatherDisplayProps {
  data: any;
  uvi?: number; 
  current?: {
    uvi?: number;
  };
  forecastData: any[];
}



const getUvIntensity = (uvi: number): string => {
  if (uvi <= 2) return 'Low';
  if (uvi <= 5) return 'Moderate';
  if (uvi <= 7) return 'High';
  if (uvi <= 10) return 'Very High';
  return 'Extreme';
};

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ data, forecastData }) => {
  const { convertTemp } = usePreferences(); 
  const { temperatureUnit } = usePreferences();
  const weather = data?.weather ? data.weather[0] : null;
  const main = data?.main;
  const sys = data?.sys;

  const formatFullDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName}, ${day}-${month}-${year}`;
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
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
      ? `${(speed * 2.237).toFixed(1)} mph` 
      : `${speed.toFixed(1)} m/s`;
  };

  return (
    <div className="weather-card">
      <div className="current-weather">
        {/* Left Section */}
        <div className="weather-main">
          <h1 className="location">{data?.name?.toUpperCase()}</h1>
          <div className="temperature-container">
            <span className="temperature">{formatTemperature(main?.temp)}</span>
            <div className="temp-range">
              <span className="high">H: {formatTemperature(main?.temp_max)}</span>
              <span className="low">L: {formatTemperature(main?.temp_min)}</span>
            </div>
          </div>
          <span className="feels-like">
            Feels like {formatTemperature(main?.feels_like)}
          </span>
        </div>

        {/* Right Section */}
        {weather && (
          <div className="weather-status">
            <img
              src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              className="weather-icon"
            />
            <span className="weather-description">{weather.description}</span>
            {data?.dt && (
              <div className="datetime-info">
                <span className="date">{formatFullDate(data.dt)}</span>
                <span className="time">{formatTime(data.dt)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Current Weather Info */}
      <div className="additional-info">
        <div className="info-item">
          <span className="label">Humidity</span>
          <span className="value">{main?.humidity}%</span>
        </div>
        <div className="info-item">
          <span className="label">Wind Speed</span>
          <span className="value">{formatWindSpeed(data?.wind?.speed)}</span>
        </div>
        <div className="info-item">
          <span className="label">UV Index</span>
          {data?.uvi !== undefined ? `${data.uvi} (${getUvIntensity(data.uvi)})` : 'N/A'} 
        </div>
        <div className="info-item">
          <span className="label">Sunrise</span>
          <span className="value">{sys?.sunrise ? formatTime(sys.sunrise) : 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="label">Sunset</span>
          <span className="value">{sys?.sunset ? formatTime(sys.sunset) : 'N/A'}</span>
        </div>
      </div>

      <ForecastDisplay data={forecastData} />
    </div>
  );
};

export default WeatherDisplay;