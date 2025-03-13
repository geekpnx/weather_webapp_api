import React from 'react';
import '../../../static/css/ForecastDisplay.css'; // Import CSS for ForecastDisplay
import { ForecastItem } from '../types/types'; // Import the ForecastItem interface

// Define the props for the ForecastDisplay component
interface ForecastDisplayProps {
  data: ForecastItem[]; // Array of forecast data
}
const ForecastDisplay: React.FC<ForecastDisplayProps> = ({ data }) => {
  const formatTemperature = (temp: number) => `${temp.toFixed(1)}°C`;

  return (
    <div className="forecast-display">
      <h2>5-Day Forecast</h2>
      {data.map((day, index) => (
        <div key={index} className="forecast-day">
          <h3>
            {day.day_name}, {day.date} {/* Display day name and date */}
          </h3>
          <div className="day-info">
            <p><strong>UV Index:</strong> {day.uv_index}</p>
            {day.sunrise && <p><strong>Sunrise:</strong> {day.sunrise}</p>}
            {day.sunset && <p><strong>Sunset:</strong> {day.sunset}</p>}
          </div>
          <div className="forecast-items">
            {day.forecasts.map((forecast, idx) => (
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
                <p><strong>Wind Speed:</strong> {forecast.wind_speed} m/s</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ForecastDisplay;