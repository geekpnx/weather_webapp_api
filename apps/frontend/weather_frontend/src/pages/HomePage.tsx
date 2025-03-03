import { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchCurrentWeather, fetchForecast } from '../api/weather';
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
  urlToImage: string | null; // Add urlToImage to the interface
}

const HomePage = () => {
  const [location, setLocation] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [radarImage, setRadarImage] = useState<string | null>(null);
  const [loadingRadar, setLoadingRadar] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const fetchNews = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("User is not authenticated. Please log in.");
      
      const response = await axios.get<NewsArticle[]>('http://127.0.0.1:8000/api/v1/weather/news/', {
        headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        // Ensure the response data includes urlToImage
        const newsData = response.data.map(article => ({
          title: article.title,
          url: article.url,
          publishedAt: article.publishedAt,
          content: article.content,
          urlToImage: article.urlToImage || null, // Handle cases where urlToImage might be missing
        }));
        setNews(newsData.slice(0, 5)); // Limit to 5 articles
      }
    } catch (error) {
      console.error("News fetch error:", error);
      setError("Failed to fetch news");
      setNews([]);
    }
  };

  const fetchRadarImage = async () => {
    try {
      setLoadingRadar(true);
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      
      const apiUrl = "http://127.0.0.1:8000/api/v1/weather/radar/";
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Token ${token}` },
        responseType: "blob",
      });
      setRadarImage(URL.createObjectURL(response.data as Blob));
    } catch (error) {
      console.error("Radar fetch error:", error);
      setError("Failed to load radar image");
    } finally {
      setLoadingRadar(false);
    }
  };

  const handleSearch = async (location: string) => {
    try {
      setLocation(location);
      const current = await fetchCurrentWeather(location);
      const forecastData = await fetchForecast(location);
      setCurrentWeather(current);
      setForecast(forecastData.data);
      const token = localStorage.getItem('auth_token');
      if (token) {
        fetchNews();
        fetchRadarImage();
      }
    } catch (error) {
      console.error("Search error:", error);
      setError(`Location "${location}" not found.`);
      setCurrentWeather(null);
      setForecast([]);
      setNews([]);
      setRadarImage(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);  // Update the authentication state
      console.log('User is authenticated');  // Log for debugging
      fetchNews();
      fetchRadarImage();
    } else {
      setIsAuthenticated(false);
      console.log('User is not authenticated');  // Log for debugging
    }
  }, []);

  const handleProfileClick = () => {
    // Redirect to profile page or open profile modal
    window.location.href = "/profile";  // Example of redirecting to profile page
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);  // Update the authentication state
    window.location.reload();  // Optionally reload the page to update UI
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
      {loadingRadar && <p>Loading radar image...</p>}
      {radarImage && <img src={radarImage} alt="Radar Map" style={{ width: "100%", maxWidth: "800px" }} />}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default HomePage;
