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

import { addFavoriteLocation } from '../api/user';


// Remove favoriteLocations and onAddFavorite from NavBarProps
interface NavBarProps {
  onSearch: (location: string) => void;
  onLogin: () => void;
  onRegister: () => void;
  favoriteLocations?: string[];       // Add this line
  onAddFavorite?: (location: string) => void;  // Add this line
}

const NavBar: React.FC<NavBarProps> = ({ 
  onSearch, 
  onLogin, 
  onRegister, 

}) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, userProfile, refreshProfile } = useAuth();
  const favoriteLocations = userProfile?.favorite_locations || [];
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  

  // Refs for click outside detection
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const favoriteDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const favoriteButtonRef = useRef<HTMLButtonElement>(null);

  const handleSearch = () => {
    if (searchLocation.trim()) {
      onSearch(searchLocation);
    } else {
      alert('Please enter a valid location.');
    }
  };

  // Update the handleAddFavorite function
  const handleAddFavorite = async () => {
    const location = searchLocation.trim();
    if (location) {
      try {
        await addFavoriteLocation(location);
        await refreshProfile();
        alert(`${location} added to favorites!`);
      } catch (error) {
        alert('Failed to add favorite location.');
      }
    } else {
      alert('Please enter a valid location before adding to favorites');
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Safari/Firefox fix for SVG clicks
      
      const actualTarget = target.closest('button') || target;


      // Profile dropdown check
      if (showProfileMenu && profileDropdownRef.current && profileButtonRef.current) {
        const profileElements = [
          profileDropdownRef.current,
          profileButtonRef.current
        ];
        if (!profileElements.some(el => el.contains(actualTarget))) {
          setShowProfileMenu(false);
        }
      }


      // Favorites dropdown check
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

  // Close dropdowns when authentication changes
  useEffect(() => {
    setShowProfileMenu(false);
    setShowFavorites(false);
  }, [isAuthenticated]);

  return (
    <div className="navbar">
      {/* Logo */}
      <div className="logo" onClick={() => navigate('/')}>
        <img src={logo} alt="WeatherApp Logo" className="logo-image" />
      </div>

      {/* Search Bar */}
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

      {/* Navigation Icons */}
      <div className="nav-icons">
        {/* Favorite Locations Dropdown */}
        {isAuthenticated && (
          <div className="dropdown-container" ref={favoriteDropdownRef}>
            <button 
              className="icon-button" 
              onClick={toggleFavorites}
              ref={favoriteButtonRef}
              type="button" // Add this for Safari
              aria-haspopup="true"
              aria-expanded={showFavorites}
            >
              <img 
                src={favoriteIcon} 
                alt="Favorite locations" 
                className="favorite-icon" 
                style={{ pointerEvents: 'none' }} // Add this line
              />
            </button>
            {showFavorites && (
              <div className="dropdown-menu">
                {favoriteLocations.map((location, index) => (
                  <div
                    key={index}
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation(); // Add this line
                      handleFavoriteSelect(location);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Dropdown */}
        <div className="dropdown-container" ref={profileDropdownRef}>
          <button 
            className="icon-button" 
            onClick={toggleProfileMenu}
            ref={profileButtonRef}
          >
            <img
              src={userProfile?.profile_picture || profileIcon}
              alt="Profile"
              className={`profile-icon ${isAuthenticated ? 'authenticated' : ''}`}
            />
          </button>
          {showProfileMenu && (
            <div className="dropdown-menu">
              {isAuthenticated ? (
                <>
                  <div className="dropdown-item" onClick={() => {
                    setShowProfileModal(true);
                    setShowProfileMenu(false);
                  }}>
                    Profile
                  </div>
                  <div className="dropdown-item" onClick={() => {
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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default NavBar;