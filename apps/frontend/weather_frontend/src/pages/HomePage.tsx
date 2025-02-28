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
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (location: string) => {
    try {
      setLocation(location);
      const current = await fetchCurrentWeather(location);
      const forecastData = await fetchForecast(location);
      setCurrentWeather(current);
      setForecast(forecastData.data);
    } catch (error) {
      console.error("Search error:", error);
      setError(`Location "${location}" not found. Please try again.`);  // Enhanced error message
      setCurrentWeather(null);
      setForecast([]);
    }
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
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default HomePage;
