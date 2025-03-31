// HomePage.tsx
import { useState, useEffect, lazy, Suspense } from 'react';
import {
  fetchCoordinates,
  fetchCurrentWeather,
  fetchForecast,
  fetchNews,
  fetchFavoriteLocations,
  addToFavorites,
  removeFromFavorites,
} from '../api/weather';

import { fetchUserProfile } from '../api/user';  
import WeatherDisplay from '../components/WeatherDisplay';
import ForecastDisplay from '../components/ForecastDisplay';
import NewsDisplay from '../components/NewsDisplay';
import NavBar from '../components/NavBar';
import AlertsButton from '../components/AlertsButton';
const ProfileModal = lazy(() => import('../components/ProfileModal'));
import UserProfile from '../components/UserProfileDisplay';
import '../../../backend/static/css/HomePage.css';
import { ForecastItem, NewsArticle } from '../types/types';

// Import our new direct-Leaflet approach
import MapComponent from '../components/MapComponent';

const HomePage = () => {
  // Basic states for location, weather, etc.
  const [location, setLocation] = useState('');
  const [prevLocation, setPrevLocation] = useState('');
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);

  // Map-related
  const [lat, setLat] = useState<number>();
  const [lon, setLon] = useState<number>();
  const [zoom, setZoom] = useState(6);

  // Let user pick "temp_new", "wind_new", etc.
  const [layer, setLayer] = useState('temp_new');

  // Favorites, error, etc.
  const [favorites, setFavorites] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auth check
  const isAuthenticated = Boolean(localStorage.getItem('auth_token'));

  // Temperature unit: 'C' => metric, 'F' => imperial
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const unitToParam = (u: 'C' | 'F') => (u === 'F' ? 'imperial' : 'metric');

  // On mount, fetch user profile => set unit => do geolocation
  useEffect(() => {
    let userPref: 'C' | 'F' = 'C';
    const doProfile = async () => {
      if (isAuthenticated) {
        try {
          const profile = await fetchUserProfile();
          userPref = profile.preferred_temperature_unit === 'F' ? 'F' : 'C';
          setUnit(userPref);
        } catch (err) {
          console.error('Could not fetch user profile for unit:', err);
        }
      }
    };
    const doGeo = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            handleSearch({ lat: latitude, lon: longitude }, userPref);
          },
          (err) => {
            console.error('Geolocation error:', err);
            setError('Unable to retrieve your location.');
          }
        );
      } else {
        setError('Geolocation is not supported by your browser.');
      }
    };

    doProfile().then(doGeo).catch((err) => console.error(err));
  }, [isAuthenticated]);

  const refetchFavorites = async () => {
    try {
      const updated = await fetchFavoriteLocations();
      setFavorites(updated);
    } catch (err) {
      console.error("Unable to fetch favorite locations:", err);
      // optionally setError
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refetchFavorites();
    }
  }, [isAuthenticated]);

  // The main search function (for city name or lat/lon)
  const handleSearch = async (
    loc: string | { lat: number; lon: number },
    overrideUnit?: 'C' | 'F'
  ) => {
    const chosenUnit = overrideUnit || unit;
    const paramUnits = unitToParam(chosenUnit);

    const previous = location;
    try {
      let current;
      let cityName = '';

      if (typeof loc === 'string') {
        // For a string search, use the string as a starting point.
        current = await fetchCurrentWeather(loc, undefined, undefined, paramUnits);
        cityName = current.name || loc; // Use the API's name if available
        setLocation(cityName);
      } else {
        // For geolocation, fetch weather and extract the nearest supported location.
        current = await fetchCurrentWeather(undefined, loc.lat, loc.lon, paramUnits);
        cityName = current.name ? current.name : 'Nearest Supported Location';
        setLocation(cityName);
      }

      const forecastData = await fetchForecast(
        typeof loc === 'string' ? loc : undefined,
        typeof loc === 'string' ? undefined : loc.lat,
        typeof loc === 'string' ? undefined : loc.lon,
        paramUnits
      );

      setCurrentWeather(current);
      setForecast(forecastData);

      // Also set lat/lon for the map
      if (typeof loc === 'string') {
        const { lat, lon } = await fetchCoordinates(loc);
        setLat(lat);
        setLon(lon);
      } else {
        setLat(loc.lat);
        setLon(loc.lon);
      }
      setZoom(10);

      // If logged in, fetch news
      if (isAuthenticated) {
        try {
          const newsData = await fetchNews(cityName);
          setNews(newsData.slice(0, 5));
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes('News API request limit reached')
          ) {
            setError(error.message);
          }
        }
      }
      setPrevLocation(cityName);
      setError(null);
    } catch (err) {
      console.error('Search error:', err);
      setLocation(previous);
      setTimeout(() => {
        window.alert(`Location "${typeof loc === 'string' ? loc : ''}" not found.`);
      }, 1.5);
    }
  };

  // Once logged in, fetch favorites
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavoriteLocations()
        .then(setFavorites)
        .catch(() => setError('Unable to fetch favorite locations.'));
    }
  }, [isAuthenticated]);

  // Let NavBar or Profile update the unit
  const handleUnitChange = (newUnit: 'C' | 'F') => {
    setUnit(newUnit);
    if (location && location !== 'Your Location') {
      handleSearch(location, newUnit);
    } else if (lat !== undefined && lon !== undefined) {
      handleSearch({ lat, lon }, newUnit);
    }
  };

  // Favorites logic
  const handleAddFavoriteCurrent = async () => {
    if (currentWeather?.name && lat !== undefined && lon !== undefined) {
      try {
        await addToFavorites(location, currentWeather.sys.country, lat, lon);
        alert('Location added to favorites!');
        const updated = await fetchFavoriteLocations();
        setFavorites(updated);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to add location to favorites.');
      }
    }
  };

  const handleDeleteFavoriteCurrent = async () => {
    if (currentWeather?.name && lat !== undefined && lon !== undefined) {
      try {
        await removeFromFavorites(location, currentWeather.sys.country, lat, lon);
        alert('Location removed from favorites!');
        const updated = await fetchFavoriteLocations();
        setFavorites(updated);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to remove location from favorites.');
      }
    }
  };

  // For switching OWM layers
  const handleLayerChange = (newLayer: string) => {
    setLayer(newLayer);
  };

  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="home-page">
      <div className='top-bar'>
        <NavBar
                onSearch={(loc) => handleSearch(loc)}
                currentLocation={
                  currentWeather?.sys?.country
                    ? `${location}, ${currentWeather.sys.country}`
                    : location
                }
                
                onProfileClick={() => setShowProfileModal(true)}
                favorites={favorites}
                onAddFavorite={handleAddFavoriteCurrent}
                onDeleteFavorite={handleDeleteFavoriteCurrent}
                onUnitChange={handleUnitChange}
                unit={unit}
              />
         {isAuthenticated && (
    <AlertsButton
      location={
        currentWeather?.sys?.country
          ? `${location}, ${currentWeather.sys.country}`
          : location
      }
    />
  )}
      </div>
      {isAuthenticated ? (
        <div className="logged-in-layout">
          {/* Left side */}
          <div className="left-half">
            {/* Current Weather */}
            <div className="left-top card">
              {error && <div className="error-message">{error}</div>}
              {currentWeather && (
                <WeatherDisplay
                  title="Current Weather"
                  data={currentWeather}
                  unit={unit}
                />
              )}
            </div>

            {/* Weather Map with OWM tiles */}
            <div className="left-bottom card">
              <div className="layer-buttons" >
                <button onClick={() => handleLayerChange('temp_new')}>Temperature</button>
                <button onClick={() => handleLayerChange('wind_new')}>Wind</button>
                <button onClick={() => handleLayerChange('clouds_new')}>Clouds</button>
                <button onClick={() => handleLayerChange('precipitation_new')}>Precip</button>
              </div>

              {lat !== undefined && lon !== undefined && (
                <MapComponent
                  lat={lat}
                  lon={lon}
                  zoom={zoom}
                  layer={layer}
                  apiKey={import.meta.env.VITE_OPENWEATHERMAP_API_KEY || ''}
                />
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="right-half">
            <div className="right-top card">
              {forecast.length > 0 && (
                <ForecastDisplay data={forecast} unit={unit} />
              )}
            </div>
            <div className="right-bottom card">
              {news.length > 0 ? (
                <NewsDisplay articles={news} />
              ) : (
                <p className="no-news-message">
                  No news articles available for {location}.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="two-column-layout">
          <div className="left-column">
            {error && <div className="error-message">{error}</div>}
            {currentWeather && (
              <WeatherDisplay
                title="Current Weather"
                data={currentWeather}
                unit={unit}
              />
            )}
          </div>
          <div className="right-column">
            {forecast.length > 0 && (
              <ForecastDisplay data={forecast} unit={unit} />
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <Suspense fallback={<div>Loading...</div>}>
        <ProfileModal onClose={() => setShowProfileModal(false)}>
          <UserProfile
            onFavoriteClick={(favLoc: string) => {
              handleSearch(favLoc);
              setShowProfileModal(false);
            }}
            onFavoriteUpdated={refetchFavorites}
          />
        </ProfileModal>
        </Suspense>
      )}

      <footer className="footer">
        <p>© 2024 Weather WebApp made with ♡</p>
      </footer>
    </div>
  );
};

export default HomePage;
