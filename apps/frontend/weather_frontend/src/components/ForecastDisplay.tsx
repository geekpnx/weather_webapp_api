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

          {/* Weather Icon */}
          <div>
            <img
              src={`https://weatherbit.io/static/img/icons/${forecast.weather.icon}.png`}
              alt={forecast.weather.description}
              width={50}  // Adjust the size as needed
            />
            <span>{forecast.weather.description}</span>
          </div>

          <p><strong>Temperature:</strong> {formatTemperature(forecast.temp)} (High: {formatTemperature(forecast.high_temp)} / Low: {formatTemperature(forecast.low_temp)}°C)</p>
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
