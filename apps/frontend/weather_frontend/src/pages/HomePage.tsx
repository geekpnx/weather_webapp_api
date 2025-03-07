import { useState, useEffect } from 'react';
import { fetchCoordinates, fetchCurrentWeather, fetchForecast, fetchNews, fetchRadarImage } from '../api/weather';
import WeatherDisplay from '../components/WeatherDisplay';
import ForecastDisplay from '../components/ForecastDisplay';
import NewsDisplay from '../components/NewsDisplay';
import NavBar from '../components/NavBar';

interface NewsArticle {
  title: string;
  url: string;
  publishedAt: string;
  content: string;
  urlToImage: string | null;
}

const HomePage = () => {
  const [location, setLocation] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [radarImage, setRadarImage] = useState<string | null>(null);
  const [loadingRadar, setLoadingRadar] = useState<boolean>(false);
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lon, setLon] = useState<number | undefined>(undefined);
  const [zoom, setZoom] = useState<number>(10);

  // Fetch weather data based on location name or geolocation
  const handleSearch = async (location: string | { lat: number; lon: number }) => {
    try {
      let current;
      if (typeof location === 'string') {
        setLocation(location);
        current = await fetchCurrentWeather(location);
      } else {
        setLocation('Your Location');
        current = await fetchCurrentWeather(undefined, location.lat, location.lon);
      }
  
      // Fetch forecast using the location name or coordinates
      const forecastData = await fetchForecast(
        typeof location === 'string' ? location : undefined,
        typeof location === 'string' ? undefined : location.lat,
        typeof location === 'string' ? undefined : location.lon
      );
  
      setCurrentWeather(current);
      setForecast(forecastData.data);
  
      // Update latitude, longitude, and zoom for the map
      if (typeof location === 'string') {
        const { lat, lon } = await fetchCoordinates(location);
        setLat(lat); // Update latitude
        setLon(lon); // Update longitude
        setZoom(10); // Reset zoom level
      } else {
        setLat(location.lat); // Update latitude
        setLon(location.lon); // Update longitude
        setZoom(10); // Reset zoom level
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
      setRadarImage(null); // Reset radar image on error
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

  // Fetch radar image when latitude, longitude, or zoom changes
  const [layer, setLayer] = useState<string>('temp'); // Default to temperature layer

  // Fetch radar image when latitude, longitude, zoom, or layer changes
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && lat !== undefined && lon !== undefined) {
      setLoadingRadar(true);
      fetchRadarImage(lat, lon, zoom, layer) // Pass the layer parameter
        .then((imageUrl) => {
          setRadarImage(imageUrl);
          setError(null); // Clear any previous errors
        })
        .catch((error) => {
          console.error('Radar fetch error:', error);
          setError('Failed to fetch radar image. Please try again later.');
          setRadarImage(null); // Reset radar image on error
        })
        .finally(() => {
          setLoadingRadar(false);
        });
    }
  }, [lat, lon, zoom, layer]); // Add layer to the dependency array

  // Layer selection UI
  const handleLayerChange = (newLayer: string) => {
    setLayer(newLayer);
  };

  return (
    <div>
      {/* NavBar */}
      <NavBar onSearch={(location) => handleSearch(location)} />

      {/* Layer Selection */}
      <div>
        <button onClick={() => handleLayerChange('map')}>Base Map</button>
        <button onClick={() => handleLayerChange('temp')}>Temperature</button>
        <button onClick={() => handleLayerChange('wind')}>Wind</button>
      </div>

      {/* Page Content */}
      <h1>Weather for {location}</h1>
      {currentWeather && <WeatherDisplay title="Current Weather" data={currentWeather} />}
      {forecast.length > 0 && <ForecastDisplay data={forecast} />}
      {news.length > 0 ? <NewsDisplay articles={news} /> : <div>No news available.</div>}
      {loadingRadar && <p>Loading radar image...</p>}
      {radarImage && <img src={radarImage} alt="Radar Map" style={{ width: '100%', maxWidth: '800px' }} />}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );

};

export default HomePage;