import React from 'react';
import '../../../static/css/WeatherDisplay.css'; // Import CSS for WeatherDisplay

interface WeatherDisplayProps {
  data: any; // This will hold the current weather or forecast data
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ data }) => {
  const weather = data?.weather ? data.weather[0] : null;
  const main = data?.main;
  const wind = data?.wind;
  const sys = data?.sys;

  const formatTemperature = (temp: number) => `${temp.toFixed(1)}°C`;

  return (
    <div className="weather-display">
      {weather ? (
        <div className="weather-content">
          <div className="weather-icon">
            <img
              src={`http://openweathermap.org/img/wn/${weather.icon}.png`}
              alt={weather.description}
              width={10}
            />
            <span><strong>{weather.description}</strong></span>
          </div>
          {main && (
            <div className="weather-details">
              <p><strong>Temperature:</strong> {formatTemperature(main.temp)}</p>
              <p><strong>Feels Like:</strong> {formatTemperature(main.feels_like)}</p>
              <p><strong>Min Temp:</strong> {formatTemperature(main.temp_min)}</p>
              <p><strong>Max Temp:</strong> {formatTemperature(main.temp_max)}</p>
              <p><strong>Humidity:</strong> {main.humidity}%</p>
            </div>
          )}
          {wind && (
            <div className="weather-details">
              <p><strong>Wind Speed:</strong> {wind.speed} m/s</p>
            </div>
          )}
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