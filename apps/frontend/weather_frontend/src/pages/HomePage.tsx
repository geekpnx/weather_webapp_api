import { useState, useEffect } from 'react';
import { fetchCurrentWeather, fetchForecast, fetchNews, fetchRadarImage } from '../api/weather';
import SearchBar from '../components/SearchBar';
import WeatherDisplay from '../components/WeatherDisplay';
import ForecastDisplay from '../components/ForecastDisplay';
import AuthButtons from '../components/AuthButtons';
import NewsDisplay from '../components/NewsDisplay';
import ProfileButton from '../components/ProfileButton.tsx';  

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
  const [loadingRadar, setLoadingRadar] = useState<boolean>(false); // Declare loading state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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

        setLoadingRadar(true); // Set loading state to true before fetching radar image
        const radarImageUrl = await fetchRadarImage();
        setRadarImage(radarImageUrl);
      }
    } catch (error) {
      console.error("Search error:", error);
      setError(`Location "${location}" not found.`);
      setCurrentWeather(null);
      setForecast([]);
      setNews([]);
      setRadarImage(null);
    } finally {
      setLoadingRadar(false); // Set loading state to false after fetching is done
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
      fetchNews().then(newsData => setNews(newsData.slice(0, 5)));

      setLoadingRadar(true); // Set loading state to true before fetching radar image
      fetchRadarImage()
        .then(setRadarImage)
        .catch((error) => {
          console.error("Radar fetch error:", error);
          setError("Failed to fetch radar image");
        })
        .finally(() => {
          setLoadingRadar(false); // Set loading state to false after fetching is done
        });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleProfileClick = () => {
    window.location.href = "/profile";
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    window.location.reload();
  };

  return (
    <div>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <AuthButtons />
        {isAuthenticated && (
          <ProfileButton 
            isAuthenticated={isAuthenticated} 
            onProfileClick={handleProfileClick} 
            onLogout={handleLogout} 
          />
        )}
      </div>
      <SearchBar onSearch={handleSearch} />
      <h1>Weather for {location}</h1>
      {currentWeather && <WeatherDisplay title="Current Weather" data={currentWeather} />}
      {forecast.length > 0 && <ForecastDisplay data={forecast} />}
      {news.length > 0 ? <NewsDisplay articles={news} /> : <div>No news available.</div>}
      {loadingRadar && <p>Loading radar image...</p>} {/* Show loading message */}
      {radarImage && <img src={radarImage} alt="Radar Map" style={{ width: "100%", maxWidth: "800px" }} />}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default HomePage;