import { useState, useEffect } from 'react';
import { fetchCoordinates, fetchCurrentWeather, fetchForecast, fetchNews, fetchRadarImage } from '../api/weather';
import WeatherDisplay from '../components/WeatherDisplay';
import NewsDisplay from '../components/NewsDisplay';
import NavBar from '../components/NavBar';
import '../assets/css/HomePage.css';
import { ForecastItem } from '../types/types';
import { NewsArticle } from '../types/types';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import AuthModal from '../components/AuthModal';

import orangeVideo from '../assets/videos/orange.mp4';
import grayVideo from '../assets/videos/gray.mp4';
import blueVideo from '../assets/videos/blue.mp4';

const HomePage = () => {
  const [backgroundVideo, setBackgroundVideo] = useState<string>(blueVideo);
  const [location, setLocation] = useState<string>('');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lon, setLon] = useState<number | undefined>(undefined);
  const [zoom, setZoom] = useState<number>(10);
  const [layer, setLayer] = useState<string>('temp_new');
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

  const getBackgroundVideo = (weatherDescription: string) => {
    const description = weatherDescription.toLowerCase();
    
    if (description.includes('sunny') || description.includes('clear')) {
      return orangeVideo;
    } else if (description.includes('cloud') || description.includes('overcast')) {
      return grayVideo;
    } else {
      return blueVideo;
    }
  };


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
      let coordinates;
  
      if (typeof location === 'string') {
        coordinates = await fetchCoordinates(location);
        cityName = location;
      } else {
        coordinates = location;
      }
  
      current = await fetchCurrentWeather(
        typeof location === 'string' ? location : undefined,
        coordinates.lat,
        coordinates.lon
      );
      
      cityName = current.name || (typeof location === 'string' ? location : 'Your Location');
      setLocation(cityName);

      if (current.weather && current.weather[0] && current.weather[0].description) {
        setBackgroundVideo(getBackgroundVideo(current.weather[0].description));
      }
  
      // Get already transformed forecast data
      const forecastData = await fetchForecast(
        typeof location === 'string' ? location : undefined,
        coordinates.lat,
        coordinates.lon
      );
  
      setCurrentWeather(current);
      setForecast(forecastData);
      setLat(coordinates.lat);
      setLon(coordinates.lon);
      setZoom(10);
  
      if (isAuthenticated) {
        try {
          const newsData = await fetchNews(cityName);
          setNews(newsData.slice(0, 5));
        } catch (error) {
          console.error('News fetch error:', error);
          setError('Failed to fetch news. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(`Error fetching data for "${location}". Please try again.`);
      setCurrentWeather(null);
      setForecast([]);
      setNews([]);
      setRadarData(null);
    }
  };

  // const handleUseMyLocation = async () => {
  //   if (!navigator.geolocation) {
  //     setError('Geolocation is not supported by your browser. Please search manually.');
  //     return;
  //   }

  //   setIsFetchingLocation(true);
  //   setError(null);
    
  //   try {
  //     const position = await new Promise<GeolocationPosition>((resolve, reject) => {
  //       navigator.geolocation.getCurrentPosition(resolve, reject);
  //     });
      
  //     const { latitude, longitude } = position.coords;
  //     await handleSearch({ lat: latitude, lon: longitude });
  //   } catch (error) {
  //     console.error('Geolocation error:', error);
  //     setError('Unable to retrieve your location. Please enable location access or search manually.');
  //   } finally {
  //     setIsFetchingLocation(false);
  //   }
  // };

  // useEffect(() => {
  //   // If no location is set after component mounts, show default location
  //   if (!location && !isFetchingLocation) {
  //     handleSearch('New York'); // or any other default city
  //   }
  // }, []);

  useEffect(() => {
    const getInitialLocation = async () => {
      if (navigator.geolocation) {
        setIsFetchingLocation(true);
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          
          const { latitude, longitude } = position.coords;
          await handleSearch({ lat: latitude, lon: longitude });
        } catch (error) {
          console.error('Geolocation error:', error);
          setError('Unable to retrieve your location. Please enable location access or search manually.');
        } finally {
          setIsFetchingLocation(false);
        }
      } else {
        setError('Geolocation is not supported by your browser. Please search manually.');
      }
    };

    getInitialLocation();
  }, []);

  useEffect(() => {
    const loadRadarData = async () => {
      if (isAuthenticated && lat !== undefined && lon !== undefined) {
        try {
          const data = await fetchRadarImage(lat, lon, zoom, layer);
          setRadarData(data);
          setError(null);
        } catch (error) {
          console.error('Radar fetch error:', error);
          setError('Failed to fetch radar image. Please try again later.');
          setRadarData(null);
        }
      }
    };

    loadRadarData();
  }, [isAuthenticated, lat, lon, zoom, layer]);

  useEffect(() => {
    const loadNews = async () => {
      if (isAuthenticated && location) {
        try {
          const newsData = await fetchNews(location);
          setNews(newsData.slice(0, 5));
        } catch (error) {
          console.error('News fetch error:', error);
          setError('Failed to fetch news. Please try again later.');
        }
      }
    };

    loadNews();
  }, [isAuthenticated, location]);

  const handleLayerChange = (newLayer: string) => {
    setLayer(newLayer);
  };

  return (
    <div className="home-page">
     <div className="video-background">
        <video autoPlay loop muted playsInline key={backgroundVideo}>
          <source src={backgroundVideo} type="video/mp4" />
        </video>
        <div className="video-overlay"></div>
      </div>

      <NavBar 
        onSearch={(location) => handleSearch(location)}
        onLogin={() => handleAuthModalOpen('login')}
        onRegister={() => handleAuthModalOpen('register')}
        favoriteLocations={favoriteLocations}
        onAddFavorite={isAuthenticated ? handleAddFavorite : undefined}
      />

      <div className="top-messages">
        {error && <div className="error-message">{error}</div>}
        {isFetchingLocation && <p className="fetching-message">Fetching your location...</p>}
        {/* <button 
          onClick={handleUseMyLocation} 
          className="location-button"
          disabled={isFetchingLocation}
        >
          {isFetchingLocation ? 'Locating...' : 'Use My Current Location'}
        </button> */}
      </div>
  
      <div className="content-container">
        {currentWeather && (
          <div className={`card weather-current ${!isAuthenticated ? 'centered' : ''}`}>
            <WeatherDisplay data={currentWeather} forecastData={forecast} />
          </div>
        )}
  
        <div className="sidebar-container">
          {isAuthenticated && radarData && (
            <div className="card maps">
              {lat !== undefined && lon !== undefined && (
                <MapComponent
                  lat={lat}
                  lon={lon}
                  zoom={zoom}
                  layer={layer}
                  apiKey={import.meta.env.VITE_OPENWEATHERMAP_API_KEY || ''}
                  boundary={radarData.boundary} 
                  onLayerChange={handleLayerChange}  
                />
              )}
            </div>
          )}
  
          {isAuthenticated && news.length > 0 && (
            <div className="card weather-news">
              <NewsDisplay articles={news} />
            </div>
          )}
        </div>
      </div>
  
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
  
      <footer className="footer">
        <p>© 2025 Weather WebApp made with ♡♡♡♡ </p>
      </footer>
    </div>
  );
};

export default HomePage;