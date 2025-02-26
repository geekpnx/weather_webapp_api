import React from 'react';

interface ForecastDisplayProps {
  data: any[];  // Array of forecast data
}

const ForecastDisplay: React.FC<ForecastDisplayProps> = ({ data }) => {
  const formatTemperature = (temp: number) => `${temp.toFixed(1)}°C`;  // Format temperature to 1 decimal place
  const formatTime = (timestamp: number) => new Date(timestamp * 1000).toLocaleTimeString(); // Format sunrise/sunset time

  return (
    <div>
      <h2>16-Day Forecast</h2>
      {data.map((forecast, index) => (
        <div key={index} style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>
          <h3>{forecast.datetime}</h3>
          <p><strong>Weather:</strong> {forecast.weather.description}</p>
          <p><strong>Temperature:</strong> {formatTemperature(forecast.temp)}°C (High: {formatTemperature(forecast.high_temp)}°C / Low: {formatTemperature(forecast.low_temp)}°C)</p>
          <p><strong>UV Index:</strong> {forecast.uv}</p>
          <p><strong>Wind Speed:</strong> {forecast.wind_spd} m/s-{forecast.wind_cdir}</p>
          <p><strong>Precipitation:</strong> {forecast.precip} mm</p>
          <p><strong>Sunrise:</strong> {formatTime(forecast.sunrise_ts)}</p>
          <p><strong>Sunset:</strong> {formatTime(forecast.sunset_ts)}</p>
        </div>
      ))}
    </div>
  );
};

export default ForecastDisplay;
