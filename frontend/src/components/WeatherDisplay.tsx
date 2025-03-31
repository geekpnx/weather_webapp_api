import React from 'react';
import '../../../backend/static/css/WeatherDisplay.css';

interface WeatherDisplayProps {
  title: string;
  data: any;
  unit: 'C' | 'F';
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ title, data, unit }) => {
  const weather = data?.weather ? data.weather[0] : null;
  const main    = data?.main;
  const wind    = data?.wind;
  const sys     = data?.sys;

  // For temperature, you already have:
  const formatTemperature = (temp: number) => {
    const suffix = unit === 'C' ? '°C' : '°F';
    return `${temp.toFixed(1)}${suffix}`;
  };

  // For wind speed, just choose the label:
  const formatWindSpeed = (speed: number) => {
    // By default, if we used units=metric, OWM gives speed in m/s
    // if we used units=imperial, OWM gives speed in mph
    const label = unit === 'C' ? 'm/s' : 'mph';
    return `${speed.toFixed(1)} ${label}`;
  };

  return (
    <div className="weather-display">
      {weather ? (
        <div className="weather-content">
          <h2>{title}</h2>
          <div className="weather-icon">
            <img
              src={`http://openweathermap.org/img/wn/${weather.icon}.png`}
              alt={weather.description}
              width={100}
            />
            <span>
              <strong>{weather.description}</strong>
            </span>
          </div>

          {/* Temperature, humidity, etc. */}
          {main && (
            <div className="weather-details">
              <p><strong>Temperature:</strong> {formatTemperature(main.temp)}</p>
              <p><strong>Feels Like:</strong> {formatTemperature(main.feels_like)}</p>
              <p><strong>Min-Max Temp:</strong> {formatTemperature(main.temp_min)} - {formatTemperature(main.temp_max)}</p>
              <p><strong>Humidity:</strong> {main.humidity}%</p>
            </div>
          )}

          {/* Wind speed */}
          {wind && (
            <div className="weather-details">
              <p><strong>Wind Speed:</strong> {formatWindSpeed(wind.speed)}</p>
            </div>
          )}

          {/* Sunrise / Sunset */}
          {sys && (
            <div className="weather-details">
              <p><strong>Sunrise:</strong> {new Date(sys.sunrise * 1000).toLocaleTimeString()}</p>
              <p><strong>Sunset:</strong> {new Date(sys.sunset * 1000).toLocaleTimeString()}</p>
            </div>
          )}
        </div>
      ) : (
        <div>No weather data available</div>
      )}
    </div>
  );
};

export default WeatherDisplay;
