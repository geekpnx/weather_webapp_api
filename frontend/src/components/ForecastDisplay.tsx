import React, { useState } from 'react';
import '../../../backend/static/css/ForecastDisplay.css';
import { ForecastItem } from '../types/types';

interface ForecastDisplayProps {
  data: ForecastItem[];
  unit: 'C' | 'F';
}

const ForecastDisplay: React.FC<ForecastDisplayProps> = ({ data, unit }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  if (!data || data.length === 0) {
    return (
      <div className="forecast-display">
        <h2>No forecast data available</h2>
      </div>
    );
  }

  // For temperature
  const formatTemperature = (temp: number) => {
    const suffix = unit === 'C' ? '°C' : '°F';
    return `${temp.toFixed(1)}${suffix}`;
  };

  // For wind speed
  const formatWindSpeed = (speed: number) => {
    const label = unit === 'C' ? 'm/s' : 'mph';
    return `${speed.toFixed(1)} ${label}`;
  };

  const selectedDay = data[selectedDayIndex];

  return (
    <div className="forecast-display">
      <h2>5-Day Forecast</h2>

      <div className="forecast-tabs">
        {data.map((day, index) => (
          <div
            key={index}
            className={`forecast-tab ${index === selectedDayIndex ? 'active' : ''}`}
            onClick={() => setSelectedDayIndex(index)}
          >
            {day.day_name}
            <br />
            <span className="forecast-tab-date">{day.date}</span>
          </div>
        ))}
      </div>

      <div className="forecast-items">
        {selectedDay.forecasts.map((forecast, idx) => (
          <div key={idx} className="forecast-item">
            <p><strong>Time:</strong> {forecast.datetime.split(' ')[1]}</p>
            <div className="weather-icon">
              <img
                src={`http://openweathermap.org/img/wn/${forecast.weather_icon}@2x.png`}
                alt={forecast.weather_description}
                width={50}
              />
              <span>{forecast.weather_description}</span>
            </div>

            <p><strong>Temperature:</strong> {formatTemperature(forecast.temperature)}</p>
            <p><strong>Feels Like:</strong> {formatTemperature(forecast.feels_like)}</p>
            <p><strong>Min Temperature:</strong> {formatTemperature(forecast.temp_min)}</p>
            <p><strong>Max Temperature:</strong> {formatTemperature(forecast.temp_max)}</p>
            <p><strong>Humidity:</strong> {forecast.humidity}%</p>

            {/* Show m/s or mph based on unit */}
            <p><strong>Wind Speed:</strong> {formatWindSpeed(forecast.wind_speed)}</p>

            <p><strong>UV Index:</strong> {selectedDay.uv_index}</p>

            {selectedDay.sunrise && (
              <p><strong>Sunrise:</strong> {selectedDay.sunrise}</p>
            )}
            {selectedDay.sunset && (
              <p><strong>Sunset:</strong> {selectedDay.sunset}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastDisplay;
