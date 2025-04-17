import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/NavBar.css';
import logo from '../assets/images/logo/logo_WA.svg';
import searchIcon from '../assets/images/icons/search-icon.svg';
import favoriteIcon from '../assets/images/icons/favorite-icon.svg';
import trashIcon from '../assets/images/icons/trash-icon.svg';
import addIcon from '../assets/images/icons/add-icon.svg';
import ProfileModal from './ProfileModal';
import { useAuth } from '../context/AuthContext';
import { removeFromFavorites, fetchCurrentWeather, fetchCoordinates, fetchFavoriteLocations, addToFavorites} from '../api/weather';
import { FavoriteLocation } from '../types/types';
import AlertsDisplay from './AlertsDisplay';
import { usePreferences } from '../context/PreferencesContext'; 
import { searchCities } from '../api/weather';


interface NavBarProps {
  onSearch: (location: string) => void;
  onLogin: () => void;
  onRegister: () => void;
  favoriteLocations: string[]; // Add this line
  onAddFavorite?: (location: string) => void; // Make it optional
}

const NavBar: React.FC<NavBarProps> = ({ onSearch, onLogin, onRegister }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, userProfile, refreshProfile } = useAuth();
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [localFavorites, setLocalFavorites] = useState<FavoriteLocation[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'profile' | 'settings'>('profile');
  const [modalKey, setModalKey] = useState(0);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState<boolean>(false);
  const { temperatureUnit, toggleTemperatureUnit } = usePreferences();

  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectSuggestion = (city: string) => {
    setSearchLocation(city);
    onSearch(city);
    setShowSuggestions(false);
  };

  const OPENWEATHER_URL = import.meta.env.VITE_OPENWEATHERMAP_BASE_URL;

  const STATIC_BASE_URL = import.meta.env.VITE_STATIC_BASE_URL;
  const defaultProPic = `${STATIC_BASE_URL}/images/propic/user_propic.svg`;

  // Refs for click outside detection
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const favoriteDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const favoriteButtonRef = useRef<HTMLButtonElement>(null);



  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    setShowFavorites(false);
  };

  const toggleFavorites = () => {
    setShowFavorites(!showFavorites);
    setShowProfileMenu(false);
  };

  const handleFavoriteSelect = (location: string) => {
    onSearch(location);
    setShowFavorites(false);
  };

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const actualTarget = target.closest('button') || target;

      if (showProfileMenu && profileDropdownRef.current && profileButtonRef.current) {
        const profileElements = [
          profileDropdownRef.current,
          profileButtonRef.current
        ];
        if (!profileElements.some(el => el.contains(actualTarget))) {
          setShowProfileMenu(false);
        }
      }

      if (showFavorites && favoriteDropdownRef.current && favoriteButtonRef.current) {
        const favoriteElements = [
          favoriteDropdownRef.current,
          favoriteButtonRef.current
        ];
        if (!favoriteElements.some(el => el.contains(actualTarget))) {
          setShowFavorites(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu, showFavorites]);

  // Reset dropdowns on auth change
  useEffect(() => {
    setShowProfileMenu(false);
    setShowFavorites(false);
  }, [isAuthenticated]);

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setModalInitialTab('profile'); // Reset to default tab
  };

  // Fetch weather data for favorites
  useEffect(() => {
    const fetchFavoritesWeather = async () => {
      if (!isAuthenticated) {
        setLocalFavorites([]);
        return;
      }

      setIsLoadingFavorites(true);
      try {
        // First get the raw favorite locations from the backend
        const favoritesResponse = await fetchFavoriteLocations();
        const favoriteLocations = favoritesResponse.favorites || [];

        // If no favorites, set empty array and return
        if (favoriteLocations.length === 0) {
          setLocalFavorites([]);
          return;
        }

        // Then fetch weather for each
        const favoritesWithWeather = await Promise.all(
          favoriteLocations.map(async (location: any) => {
            try {
              const weatherData = await fetchCurrentWeather(location.city_name);
              return {
                name: location.city_name,
                temp: Math.round(weatherData.main.temp),
                icon: weatherData.weather[0].icon,
                weatherDescription: weatherData.weather[0].description,
                country_code: location.country_code || '',
                lat: location.latitude,
                lon: location.longitude
              } as FavoriteLocation;
            } catch (error) {
              console.error(`Failed to fetch weather for ${location.city_name}:`, error);
              return {
                name: location.city_name,
                country_code: location.country_code || '',
                lat: location.latitude,
                lon: location.longitude
              } as FavoriteLocation;
            }
          })
        );
        setLocalFavorites(favoritesWithWeather);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setLocalFavorites([]);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    fetchFavoritesWeather();
  }, [isAuthenticated]); // Removed userProfile?.favorite_locations dependency

  // Notification timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);


  // Fetch city suggestions when search location changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchLocation.trim().length > 2) { // Only fetch after 3 characters
        try {
          const suggestions = await searchCities(searchLocation);
          setCitySuggestions(suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching city suggestions:", error);
          setCitySuggestions([]);
        }
      } else {
        setCitySuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300); // Debounce to avoid too many API calls
    
    return () => clearTimeout(debounceTimer);
  }, [searchLocation]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format the search input to capitalize first letter
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length === 0) {
      setSearchLocation('');
      return;
    }
    
    // Capitalize first letter and keep the rest as-is
    const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    setSearchLocation(formattedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
      setShowSuggestions(false);
    }
  };

  const handleSearch = async () => {
    const location = searchLocation.trim();
    if (!location) {
      setNotification({ message: 'Please enter a valid location', type: 'error' });
      return;
    }

    try {
      // First validate it's a real city by getting coordinates
      await fetchCoordinates(location);
      // If we get here, the city is valid
      onSearch(location);
      setShowSuggestions(false);
    } catch (error) {
      setNotification({ 
        message: error instanceof Error ? 
          error.message : 
          `${location} is not a valid city name`, 
        type: 'error' 
      });
    }
  };



  const handleAddFavorite = async () => {
    const location = searchLocation.trim();
    if (!location) {
      setNotification({ message: 'Please enter a location', type: 'error' });
      return;
    }
  
    try {
      // First validate the city exists by fetching coordinates
      const { lat, lon } = await fetchCoordinates(location);
      
      // Check for duplicates (case-insensitive)
      const normalizedInput = location.toLowerCase().trim();
      const isDuplicate = localFavorites.some(fav => 
        fav.name.toLowerCase() === normalizedInput
      );
      
      if (isDuplicate) {
        setNotification({ 
          message: `${location} is already in your favorites`, 
          type: 'error' 
        });
        return;
      }
      
      // Add to backend
      await addToFavorites(location, '', lat, lon);
      
      // Update local state optimistically
      const newFavorite = {
        name: location,
        temp: 0,
        icon: '',
        weatherDescription: '',
        country_code: '',
        lat,
        lon
      };
      
      setLocalFavorites(prev => [newFavorite, ...prev]);
      
      // Now fetch weather data to update the favorite
      try {
        const weatherData = await fetchCurrentWeather(location);
        setLocalFavorites(prev => 
          prev.map(fav => 
            fav.name === location 
              ? { 
                  ...fav, 
                  temp: Math.round(weatherData.main.temp),
                  icon: weatherData.weather[0].icon,
                  weatherDescription: weatherData.weather[0].description
                } 
              : fav
          )
        );
      } catch (weatherError) {
        console.error("Couldn't fetch weather for new favorite:", weatherError);
        // Keep the favorite even if weather fetch fails
      }
      
      setNotification({ 
        message: `${location} added to favorites!`, 
        type: 'success' 
      });
      
    } catch (error) {
      let errorMessage = 'Failed to add favorite location';
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = `${location} is not a valid city name`;
        } else if (error.message.includes('already in favorites')) {
          errorMessage = `${location} is already in your favorites`;
        } else {
          errorMessage = error.message;
        }
      }
      
      setNotification({ 
        message: errorMessage, 
        type: 'error' 
      });
    }
  };


  const handleRemoveFavorite = async (favorite: FavoriteLocation) => {
    try {
      await removeFromFavorites(favorite);
      setLocalFavorites(prev => prev.filter(fav => fav.name !== favorite.name));
      if (refreshProfile) {
        await refreshProfile();
      }  
      setNotification({ message: `${favorite.name} removed from favorites`, type: 'success' });
    } catch (error) {
      console.error("Error removing favorite:", error);
      setNotification({ 
        message: error instanceof Error ? error.message : 'Failed to remove favorite location', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="navbar">
      <div className="logo" onClick={() => navigate('/')}>
        <img src={logo} alt="WeatherApp Logo" className="logo-image" />
      </div>

      <div className="search-container">
      <div className="temperature-toggle">
                <span className="unit">°C</span>
                <button
                  type="button"
                  className={`toggle-button ${temperatureUnit === 'F' ? 'active' : ''}`}
                  onClick={toggleTemperatureUnit}
                >
                  <div className="toggle-switch">
                    <div className="toggle-knob" />
                  </div>
                </button>
                <span className="unit">°F</span>
              </div>
              <div className="input-with-add">
                <div className="search-input-container" ref={searchInputRef}>
                  <input
                    type="text"
                    id="location-input"
                    name="location"
                    value={searchLocation}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter location"
                    className="search-input"
                    autoComplete="off"
                  />
                  {showSuggestions && citySuggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {citySuggestions.map((city, index) => (
                        <div 
                          key={index} 
                          className="suggestion-item"
                          onClick={() => selectSuggestion(city)}
                        >
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {isAuthenticated && (
                  <button
                    onClick={handleAddFavorite}
                    className="add-button"
                    title="Add to favorites"
                  >
                    <img src={addIcon} alt="Add" className="add-icon" />
                  </button>
                )}
              </div>
              <button onClick={handleSearch} className="search-button">
                <img src={searchIcon} alt="Search" className="search-icon" />
              </button>
            </div>

      <div className="nav-icons">
      {isAuthenticated && <AlertsDisplay />}
        {isAuthenticated && (
          <div className="favorite-notification-container">
            <div className="dropdown-container" ref={favoriteDropdownRef}>
              {notification && (
                <div className={`notification-bubble ${notification.type}`}>
                  {notification.message}
                </div>
              )}
              <button
                className="icon-button"
                onClick={toggleFavorites}
                ref={favoriteButtonRef}
                type="button"
                aria-haspopup="true"
                aria-expanded={showFavorites}
              >
                <img
                  src={favoriteIcon}
                  alt="Favorite locations"
                  className="favorite-icon"
                  style={{ pointerEvents: 'none' }}
                />
              </button>
              {showFavorites && (
                <div className="dropdown-menu favorites-dropdown">
                  {isLoadingFavorites && (
                    <div className="loading-spinner">Loading...</div>
                  )}

                  {!isLoadingFavorites && localFavorites.length === 0 && (
                    <div className="dropdown-item empty-state">
                      No favorite locations saved yet
                    </div>
                  )}

                  {!isLoadingFavorites && localFavorites.map((favorite, index) => (
                    <div
                      key={`${favorite.name}-${index}`}
                      className="favorite-card"
                    >
                      <div
                        className="favorite-content"
                        onClick={() => {
                          handleFavoriteSelect(favorite.name);
                          setShowFavorites(false);
                        }}
                      >
                        <div className="favorite-location">{favorite.name}</div>
                        {favorite.temp && (
                          <div className="favorite-weather">
                            <div className="favorite-temp">{favorite.temp}°</div>
                            {favorite.icon && (
                              <img
                                src={`${OPENWEATHER_URL}/img/wn/${favorite.icon}.png`}
                                alt={favorite.weatherDescription || 'Weather icon'}
                                className="favorite-icon"
                              />
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(favorite);
                        }}
                        className="remove-favorite"
                        title="Remove from favorites"
                      >
                        <img src={trashIcon} alt="Remove" className="trash-icon" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="dropdown-container" ref={profileDropdownRef}>
          <button
            className="icon-button"
            onClick={toggleProfileMenu}
            ref={profileButtonRef}
          >
            <img
              src={
                isAuthenticated && userProfile?.profile_picture
                  ? `${userProfile.profile_picture.replace('http://', 'https://')}?ts=${Date.now()}`
                  : defaultProPic
              }
              alt="Profile"
              className={`profile-icon ${isAuthenticated ? 'authenticated' : ''}`}
              key={
                isAuthenticated && userProfile?.profile_picture
                  ? `${userProfile.profile_picture}-${Date.now()}`
                  : `default-${Date.now()}`
              }
            />
          </button>
          {showProfileMenu && (
            <div className="dropdown-menu">
              {isAuthenticated ? (
                <>
                  <div className="dropdown-item" onClick={() => {
                    setModalInitialTab('profile');
                    setShowProfileModal(true);
                    setShowProfileMenu(false);
                  }}>
                    Profile
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    setModalInitialTab('settings');
                    setShowProfileModal(true);
                    setShowProfileMenu(false);
                  }}>
                    Settings
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}>
                    Logout
                  </div>
                </>
              ) : (
                <>
                  <div className="dropdown-item" onClick={() => {
                    onLogin();
                    setShowProfileMenu(false);
                  }}>
                    Login
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    onRegister();
                    setShowProfileMenu(false);
                  }}>
                    Sign Up
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <ProfileModal
        key={`profile-modal-${modalKey}`}
        isOpen={showProfileModal}
        onClose={() => {
          handleCloseProfileModal();
          setModalKey(prev => prev + 1); // Force remount on close
        }}
        initialTab={modalInitialTab}
      />
    </div>
  );
};

export default NavBar;
