import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../static/css/NavBar.css';
import logo from '../../../static/images/logo/logo_WA.svg';
import searchIcon from '../../../static/images/icons/search-icon.svg';
import profileIcon from '../../../static/images/propic/user_propic.svg';
import favoriteIcon from '../../../static/images/icons/favorite-icon.svg';
import addIcon from '../../../static/images/icons/add-icon.svg';
import ProfileModal from './ProfileModal';
import { useAuth } from '../context/AuthContext';
import { addFavoriteLocation, removeFavoriteLocation } from '../api/user';

interface NavBarProps {
  onSearch: (location: string) => void;
  onLogin: () => void;
  onRegister: () => void;
  favoriteLocations: string[];  // Add this line
  onAddFavorite?: (location: string) => void;  // Add this line (optional)
}

const NavBar: React.FC<NavBarProps> = ({ onSearch, onLogin, onRegister }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, userProfile, refreshProfile } = useAuth();
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'profile' | 'settings'>('profile');
  const [modalKey, setModalKey] = useState(0);


  // Refs for click outside detection
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const favoriteDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const favoriteButtonRef = useRef<HTMLButtonElement>(null);

  // Sync local favorites with profile
  useEffect(() => {
    if (userProfile?.favorite_locations) {
      setLocalFavorites(userProfile.favorite_locations);
    }
  }, [userProfile]);

  // Notification timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSearch = () => {
    const location = searchLocation.trim();
    if (location) {
      onSearch(location);
    } else {
      setNotification({ message: 'Please enter a valid location', type: 'error' });
    }
  };

  const handleAddFavorite = async () => {
    const location = searchLocation.trim();
    if (!location) {
      setNotification({ message: 'Please enter a location before adding', type: 'error' });
      return;
    }

    // Check for duplicates
    if (localFavorites.includes(location) || userProfile?.favorite_locations?.includes(location)) {
      setNotification({ message: `${location} is already in favorites`, type: 'error' });
      return;
    }

    try {
      // Optimistic update
      const newFavorites = [location, ...localFavorites].slice(0, 5);
      setLocalFavorites(newFavorites);
      
      await addFavoriteLocation(location);
      await refreshProfile();
      setNotification({ message: `${location} added to favorites!`, type: 'success' });
    } catch (error) {
      setLocalFavorites(userProfile?.favorite_locations || []);
      setNotification({ message: 'Failed to add favorite location', type: 'error' });
    }
  };

  const handleRemoveFavorite = async (location: string) => {
    try {
      const newFavorites = localFavorites.filter(l => l !== location);
      setLocalFavorites(newFavorites);
      
      await removeFavoriteLocation(location);
      await refreshProfile();
      setNotification({ message: `${location} removed from favorites`, type: 'success' });
    } catch (error) {
      setLocalFavorites(userProfile?.favorite_locations || []);
      setNotification({ message: 'Failed to remove favorite location', type: 'error' });
    }
  };

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

  return (
    <div className="navbar">
      <div className="logo" onClick={() => navigate('/')}>
        <img src={logo} alt="WeatherApp Logo" className="logo-image" />
      </div>

      <div className="search-container">
        <div className="input-with-add">
          <input
            type="text"
            id="location-input"
            name="location"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Enter location"
            className="search-input"
          />
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
                <div className="dropdown-menu">
                  {localFavorites.length === 0 && (
                    <div className="dropdown-item empty-state">
                      No favorite locations saved yet
                    </div>
                  )}

                  {localFavorites.map((location, index) => (
                    <div
                      key={index}
                      className="dropdown-item"
                      role="button"
                      tabIndex={0}
                    >
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteSelect(location);
                        }}
                      >
                        {location}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(location);
                        }}
                        className="remove-favorite"
                        title="Remove from favorites"
                      >
                        x
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
                  ? `${userProfile.profile_picture}?ts=${Date.now()}`
                  : profileIcon
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