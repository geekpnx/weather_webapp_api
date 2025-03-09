import React from 'react';
import '../../../static/css/ForecastDisplay.css'; // Import CSS for ForecastDisplay

interface ForecastDisplayProps {
  data: any[]; // Array of forecast data
}

const ForecastDisplay: React.FC<ForecastDisplayProps> = ({ data }) => {
  const formatTemperature = (temp: number) => `${temp.toFixed(1)}°C`;
  const formatTime = (timestamp: number) => new Date(timestamp * 1000).toLocaleTimeString();

  return (
    <div className="forecast-display">
      <h2>16-Day Forecast</h2>
      {data.map((forecast, index) => (
        <div key={index} className="forecast-item">
          <h3>{forecast.datetime}</h3>
          <div className="weather-icon">
            <img
              src={`https://weatherbit.io/static/img/icons/${forecast.weather.icon}.png`}
              alt={forecast.weather.description}
              width={50}
            />
            <span>{forecast.weather.description}</span>
          </div>
          <p><strong>Temperature:</strong> {formatTemperature(forecast.temp)} (High: {formatTemperature(forecast.high_temp)} / Low: {formatTemperature(forecast.low_temp)})</p>
          <p><strong>UV Index:</strong> {forecast.uv}</p>
          <p><strong>Wind Speed:</strong> {forecast.wind_spd} m/s - {forecast.wind_cdir}</p>
          <p><strong>Precipitation:</strong> {forecast.precip} mm</p>
          <p><strong>Sunrise:</strong> {formatTime(forecast.sunrise_ts)}</p>
          <p><strong>Sunset:</strong> {formatTime(forecast.sunset_ts)}</p>
        </div>
      ))}
    </div>
  );
};

export default ForecastDisplay;