import React from 'react';

interface WeatherDisplayProps {
  title: string;
  data: any;  // This will hold the current weather or forecast data
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ title, data }) => {
  // Ensure data is available and structure is correct
  const weather = data?.weather[0];
  const main = data?.main;
  const wind = data?.wind;
  const sys = data?.sys;

  const formatTemperature = (temp: number) => `${temp.toFixed(1)}°C`; // Format temperature to 1 decimal place

  return (
    <div>
      <h2>{title}</h2>
      {title === 'Current Weather' ? (
        <div>
          {weather && (
            <div>
              <p><strong>Weather:</strong> {weather.main} - {weather.description}</p>
              <img src={`http://openweathermap.org/img/wn/${weather.icon}.png`} alt={weather.description} />
            </div>
          )}
          {main && (
            <div>
              <p><strong>Temperature:</strong> {formatTemperature(main.temp)}</p>
              <p><strong>Feels Like:</strong> {formatTemperature(main.feels_like)}</p>
              <p><strong>Min Temp:</strong> {formatTemperature(main.temp_min)}</p>
              <p><strong>Max Temp:</strong> {formatTemperature(main.temp_max)}</p>
              <p><strong>Humidity:</strong> {main.humidity}%</p>
            </div>
          )}
          {wind && (
            <div>
              <p><strong>Wind Speed:</strong> {wind.speed} m/s</p>
            </div>
          )}
          {sys && (
            <div>
              <p><strong>Sunrise:</strong> {new Date(sys.sunrise * 1000).toLocaleTimeString()}</p>
              <p><strong>Sunset:</strong> {new Date(sys.sunset * 1000).toLocaleTimeString()}</p>
            </div>
          )}
        </div>
      ) : (
        <div> {/* Forecast data handling, if necessary */}</div>
      )}
    </div>
  );
};

export default WeatherDisplay;
