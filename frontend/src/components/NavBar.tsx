import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../backend/static/css/NavBar.css';
import logo from '../../../backend/static/img/logo_WA.svg';
import searchIcon from '../../../backend/static/img/search-icon.svg';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext'; // Import useAuth

interface NavBarProps {
  onSearch: (location: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useAuth(); // Use global auth state
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  // Handle search
  const handleSearch = () => {
    if (searchLocation.trim()) {
      onSearch(searchLocation);
    } else {
      alert('Please enter a valid location.');
    }
  };

  // Open AuthModal in login mode
  const handleLoginClick = () => {
    setIsRegisterMode(false); // Set to login mode
    setIsAuthModalOpen(true); // Open the modal
  };

  // Open AuthModal in registration mode
  const handleRegisterClick = () => {
    setIsRegisterMode(true); // Set to registration mode
    setIsAuthModalOpen(true); // Open the modal
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    login(); // Update global auth state
    setIsAuthModalOpen(false); // Close the modal after successful login
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
          id="location-input" // Add a unique ID
          name="location" // Add a name attribute
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
            <button onClick={() => navigate('/profile')} className="profile-button">
              Profile
            </button>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </>
        )}
      </div>

      {/* AuthModal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        isRegisterMode={isRegisterMode}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default NavBar;