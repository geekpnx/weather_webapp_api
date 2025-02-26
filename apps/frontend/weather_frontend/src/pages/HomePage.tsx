import { useState } from 'react';
import { fetchCurrentWeather, fetchForecast } from '../api/weather';
import SearchBar from '../components/SearchBar';
import WeatherDisplay from '../components/WeatherDisplay';
import ForecastDisplay from '../components/ForecastDisplay';
import AuthButtons from '../components/AuthButtons';

const HomePage = () => {
  const [location, setLocation] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);

  const handleSearch = async (location: string) => {
    setLocation(location);
    const current = await fetchCurrentWeather(location);
    const forecastData = await fetchForecast(location);
    setCurrentWeather(current);
    setForecast(forecastData.data);  // Assuming the forecast data is in the `data` field
  };

  return (
    <div>
      {/* Display Auth Buttons */}
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <AuthButtons />
      </div>

      {/* Main Content */}
      <SearchBar onSearch={handleSearch} />
      <h1>Weather for {location}</h1>

      {currentWeather && <WeatherDisplay title="Current Weather" data={currentWeather} />}
      {forecast.length > 0 && <ForecastDisplay data={forecast} />}
    </div>
  );
};

export default HomePage;
