import { useState, useEffect } from 'react';
import { fetchCurrentWeather, fetchForecast, fetchNews, fetchRadarImage } from '../api/weather';
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
        typeof location === 'string' ? location : undefined, // Pass location name if available
        typeof location === 'string' ? undefined : location.lat, // Pass lat if available
        typeof location === 'string' ? undefined : location.lon // Pass lon if available
      );
  
      setCurrentWeather(current);
      setForecast(forecastData.data);
  
      const token = localStorage.getItem('auth_token');
      if (token) {
        const newsData = await fetchNews();
        setNews(newsData.slice(0, 5)); // Limit to 5 articles
  
        setLoadingRadar(true);
        const radarImageUrl = await fetchRadarImage();
        setRadarImage(radarImageUrl);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(`Location "${location}" not found.`);
      setCurrentWeather(null);
      setForecast([]);
      setNews([]);
      setRadarImage(null);
    } finally {
      setLoadingRadar(false);
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

  // Fetch news and radar image for authenticated users
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchNews().then((newsData) => setNews(newsData.slice(0, 5)));

      setLoadingRadar(true);
      fetchRadarImage()
        .then(setRadarImage)
        .catch((error) => {
          console.error('Radar fetch error:', error);
          setError('Failed to fetch radar image');
        })
        .finally(() => {
          setLoadingRadar(false);
        });
    }
  }, []);

  return (
    <div>
      {/* NavBar */}
      <NavBar onSearch={(location) => handleSearch(location)} />

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