import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../backend/static/css/NavBar.css';
import logo from '../../../backend/static/images/logo/logo_WA.svg';
import searchIcon from '../../../backend/static/images/icons/search-icon.svg';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';  // Add this import
import { useAuth } from '../context/AuthContext';

interface NavBarProps {
  onSearch: (location: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useAuth();
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);  // New state for profile modal

  const handleSearch = () => {
    if (searchLocation.trim()) {
      onSearch(searchLocation);
    } else {
      alert('Please enter a valid location.');
    }
  };

  const handleLoginClick = () => {
    setIsRegisterMode(false);
    setIsAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setIsRegisterMode(true);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = () => {
    login();
    setIsAuthModalOpen(false);
  };

  return (
    <div className="navbar">
      {/* Logo */}
      <div className="logo" onClick={() => navigate('/')}>
        <img src={logo} alt="WeatherApp Logo" className="logo-image" />
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <label htmlFor="location-input" className="sr-only"></label>
        <input
          type="text"
          id="location-input"
          name="location"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          placeholder="Enter location"
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          <img src={searchIcon} alt="Search" className="search-icon" />
        </button>
      </div>

      {/* Auth/Profile Buttons */}
      <div className="auth-buttons">
        {!isAuthenticated ? (
          <>
            <button onClick={handleLoginClick} className="login-button">
              Login
            </button>
            <button onClick={handleRegisterClick} className="register-button">
              Register
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setShowProfileModal(true)}  // Changed to open profile modal
              className="profile-button"
            >
              Profile
            </button>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isRegisterMode={isRegisterMode}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default NavBar;