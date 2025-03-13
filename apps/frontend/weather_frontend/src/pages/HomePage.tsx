import { useState, useEffect } from 'react';
import { fetchCoordinates, fetchCurrentWeather, fetchForecast, fetchNews, fetchRadarImage } from '../api/weather';
import WeatherDisplay from '../components/WeatherDisplay';
import ForecastDisplay from '../components/ForecastDisplay';
import NewsDisplay from '../components/NewsDisplay';
import NavBar from '../components/NavBar';
import '../../../static/css/HomePage.css'; // Import the new CSS file
import { ForecastItem } from '../types/types'; // Import the ForecastItem interface
import { NewsArticle } from '../types/types'; // Import the NewArticle interface


const HomePage = () => {
  const [location, setLocation] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [radarImage, setRadarImage] = useState<string | null>(null);
  const [loadingRadar, setLoadingRadar] = useState<boolean>(false);
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lon, setLon] = useState<number | undefined>(undefined);
  const [zoom, setZoom] = useState<number>(10);
  const [layer, setLayer] = useState<string>('temp'); // Default to temperature layer
  const [forecast, setForecast] = useState<ForecastItem[]>([]); // Ensure forecast state is typed as ForecastItem[]

  // Fetch weather data based on location name or geolocation
  const handleSearch = async (location: string | { lat: number; lon: number }) => {
    try {
      let current;
      let cityName = '';
  
      if (typeof location === 'string') {
        // If location is a string (city name)
        setLocation(location);
        current = await fetchCurrentWeather(location);
        cityName = location; // Use the provided city name
      } else {
        // If location is an object (geolocation)
        current = await fetchCurrentWeather(undefined, location.lat, location.lon);
  
        // Extract city name from the CurrentWeather response
        cityName = current.name || 'Your Location'; // Fallback to 'Your Location' if name is not available
        setLocation(cityName); // Set the city name as the location
      }
  
      const forecastData = await fetchForecast(
        typeof location === 'string' ? location : undefined,
        typeof location === 'string' ? undefined : location.lat,
        typeof location === 'string' ? undefined : location.lon
      );
  
      setCurrentWeather(current);
      setForecast(forecastData);
  
      if (typeof location === 'string') {
        const { lat, lon } = await fetchCoordinates(location);
        setLat(lat);
        setLon(lon);
        setZoom(10);
      } else {
        setLat(location.lat);
        setLon(location.lon);
        setZoom(10);
      }
  
      const token = localStorage.getItem('auth_token');
      if (token) {
        const newsData = await fetchNews();
        setNews(newsData.slice(0, 5)); // Limit to 5 articles
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(`Location "${location}" not found.`);
      setCurrentWeather(null);
      setForecast([]);
      setNews([]);
      setRadarImage(null);
    }
  };

  // Fetch user's geolocation on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleSearch({ lat: latitude, lon: longitude });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to retrieve your location.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  // Fetch radar image when latitude, longitude, zoom, or layer changes
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && lat !== undefined && lon !== undefined) {
      setLoadingRadar(true);
      fetchRadarImage(lat, lon, zoom, layer)
        .then((imageUrl) => {
          setRadarImage(imageUrl);
          setError(null);
        })
        .catch((error) => {
          console.error('Radar fetch error:', error);
          setError('Failed to fetch radar image. Please try again later.');
          setRadarImage(null);
        })
        .finally(() => {
          setLoadingRadar(false);
        });
    }
  }, [lat, lon, zoom, layer]);

  // Layer selection UI
  const handleLayerChange = (newLayer: string) => {
    setLayer(newLayer);
  };

  return (
    <div className="home-page">
      {/* NavBar */}
      <NavBar onSearch={(location) => handleSearch(location)} />
  
      {/* Page Content */}
      <div className="content-container">
        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}
  
        {/* Weather Display */}
        {currentWeather && (
          <div className="card weather-current">
            <h1>{location}</h1>
            <WeatherDisplay title="Current Weather" data={currentWeather} />
          </div>
        )}
  
        {/* Forecast Display */}
        {forecast.length > 0 && (
          <div className="card forecast">
            <ForecastDisplay data={forecast} />
          </div>
        )}
  
        {/* News Display */}
        {news.length > 0 && (
          <div className="card weather-news">
            <NewsDisplay articles={news} />
          </div>
        )}
  
        {/* Radar Map */}
        <div className="card maps">
          <div className="layer-buttons">
            <button onClick={() => handleLayerChange('map')}>Base Map</button>
            <button onClick={() => handleLayerChange('temp')}>Temperature</button>
            <button onClick={() => handleLayerChange('wind')}>Wind</button>
          </div>
          {loadingRadar && <p>Loading radar image...</p>}
          {radarImage && <img src={radarImage} alt="Radar Map" className="radar-image" />}
        </div>
      </div>
  
      {/* Footer */}
      <footer className="footer">
        <p>© 2024 Weather WebApp made with ♡</p>
      </footer>
    </div>
  );
};

export default HomePage;