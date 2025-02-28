import React from 'react';

interface WeatherDisplayProps {
  title: string;
  data: any;  // This will hold the current weather or forecast data
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ title, data }) => {
  // Ensure data is available and structure is correct
  const weather = data?.weather ? data.weather[0] : null;
  const main = data?.main;
  const wind = data?.wind;
  const sys = data?.sys;

  const formatTemperature = (temp: number) => `${temp.toFixed(1)}°C`; // Format temperature to 1 decimal place

  return (
    <div>
      <h2>{title}</h2>
      {title === 'Current Weather' && weather ? (
        <div>
          <div>
            {/* Weather Icon and Description */}
            <img
              src={`http://openweathermap.org/img/wn/${weather.icon}.png`}
              alt={weather.description}
              width={50}  // Adjust the size as needed
            />
            <span><strong>{weather.main}</strong> - {weather.description}</span>
          </div>
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
        <div>No weather data available</div>  // If no weather data or title is not 'Current Weather'
      )}
    </div>
  );
};

export default WeatherDisplay;
