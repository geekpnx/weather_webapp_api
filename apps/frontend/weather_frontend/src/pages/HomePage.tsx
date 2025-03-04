import { useState, useEffect } from 'react';
import { fetchCurrentWeather, fetchForecast, fetchNews, fetchRadarImage } from '../api/weather';
import WeatherDisplay from '../components/WeatherDisplay';
import ForecastDisplay from '../components/ForecastDisplay';
import NewsDisplay from '../components/NewsDisplay';
import NavBar from '../components/NavBar'; // Import the new NavBar

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

  const handleSearch = async (location: string) => {
    try {
      setLocation(location);
      const current = await fetchCurrentWeather(location);
      const forecastData = await fetchForecast(location);
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
      <NavBar onSearch={handleSearch} />

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