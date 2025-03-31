import { useState, useEffect } from 'react';
import { fetchCoordinates, fetchCurrentWeather, fetchForecast, fetchNews, fetchRadarImage } from '../api/weather';
import WeatherDisplay from '../components/WeatherDisplay';
import ForecastDisplay from '../components/ForecastDisplay';
import NewsDisplay from '../components/NewsDisplay';
import NavBar from '../components/NavBar';
import '../../../static/css/HomePage.css';
import { ForecastItem } from '../types/types';
import { NewsArticle } from '../types/types';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import AuthModal from '../components/AuthModal';

const HomePage = () => {
  const [location, setLocation] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lon, setLon] = useState<number | undefined>(undefined);
  const [zoom, setZoom] = useState<number>(10);
  const [layer, setLayer] = useState<string>('map');
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [radarData, setRadarData] = useState<{ imageUrl: string; center: { lat: number; lon: number }; boundary: [number, number][] } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [favoriteLocations, setFavoriteLocations] = useState<string[]>(() => {
  const saved = localStorage.getItem('favoriteLocations');
    return saved ? JSON.parse(saved) : [];
  });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const saved = localStorage.getItem('favoriteLocations');
      if (saved) setFavoriteLocations(JSON.parse(saved));
    } else {
      setFavoriteLocations([]);
    }
  }, [isAuthenticated]);

  const handleAuthModalOpen = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAddFavorite = (location: string) => {
    setFavoriteLocations(prev => {
      if (!prev.includes(location)) {
        const updated = [...prev, location];
        localStorage.setItem('favoriteLocations', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  };

  const handleSearch = async (location: string | { lat: number; lon: number }) => {
    try {
      let current;
      let cityName = '';

      if (typeof location === 'string') {
        setLocation(location);
        current = await fetchCurrentWeather(location);
        cityName = location;
      } else {
        current = await fetchCurrentWeather(undefined, location.lat, location.lon);
        cityName = current.name || 'Your Location';
        setLocation(cityName);
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

      if (isAuthenticated) {
        try {
          const newsData = await fetchNews(cityName);
          setNews(newsData.slice(0, 5));
        } catch (error) {
          if (error instanceof Error && error.message.includes('News API request limit reached')) {
            setError(error.message);
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(`Location "${location}" not found.`);
      setCurrentWeather(null);
      setForecast([]);
      setNews([]);
      setRadarData(null);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      setIsFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleSearch({ lat: latitude, lon: longitude });
          setIsFetchingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to retrieve your location. Please enable location access or search manually.');
          setIsFetchingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please search manually.');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && lat !== undefined && lon !== undefined) {
      fetchRadarImage(lat, lon, zoom, layer)
        .then((data) => {
          setRadarData(data);
          setError(null);
        })
        .catch((error) => {
          console.error('Radar fetch error:', error);
          setError('Failed to fetch radar image. Please try again later.');
          setRadarData(null);
        });
    } else {
      setRadarData(null);
    }
  }, [isAuthenticated, lat, lon, zoom, layer]);

  useEffect(() => {
    if (isAuthenticated && lat !== undefined && lon !== undefined) {
      fetchNews()
        .then((newsData) => {
          setNews(newsData.slice(0, 5));
        })
        .catch((error) => {
          console.error('News fetch error:', error);
          setError('Failed to fetch news. Please try again later.');
        });
    } else {
      setNews([]);
    }
  }, [isAuthenticated, lat, lon]);

  const handleLayerChange = (newLayer: string) => {
    setLayer(newLayer);
  };

  return (
    <div className="home-page">
      <NavBar 
        onSearch={(location) => handleSearch(location)}
        onLogin={() => handleAuthModalOpen('login')}
        onRegister={() => handleAuthModalOpen('register')}
        favoriteLocations={favoriteLocations}
        onAddFavorite={isAuthenticated ? handleAddFavorite : undefined}
      />

      <div className="content-container">
        {error && <div className="error-message">{error}</div>}
        {isFetchingLocation && <p>Fetching your location...</p>}

        {currentWeather && (
          <div className="card weather-current">
            <h1>{location}</h1>
            <WeatherDisplay data={currentWeather} />
          </div>
        )}

        {forecast.length > 0 && (
          <div className="card forecast">
            <ForecastDisplay data={forecast} />
          </div>
        )}

        {news.length > 0 && (
          <div className="card weather-news">
            <NewsDisplay articles={news} />
          </div>
        )}

        {isAuthenticated && radarData && (
          <div className="card maps">
            <div className="layer-buttons">
              <button onClick={() => handleLayerChange('map')}>Base Map</button>
              <button onClick={() => handleLayerChange('temp')}>Temperature</button>
              <button onClick={() => handleLayerChange('wind')}>Wind</button>
            </div>
            <MapComponent
              lat={radarData.center.lat}
              lon={radarData.center.lon}
              zoom={zoom}
              boundary={radarData.boundary}
              imageUrl={radarData.imageUrl}
            />
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <footer className="footer">
        <p>© 2024 Weather WebApp made with ♡</p>
      </footer>
    </div>
  );
};

export default HomePage;