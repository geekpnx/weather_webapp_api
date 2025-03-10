import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../static/css/NavBar.css'; // Import the CSS file
import logo from '../../../static/img/logo_WA.svg'; // Import the logo image
import searchIcon from '../../../static/img/search-icon.svg'; // Import the search icon


interface NavBarProps {
  onSearch: (location: string) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [searchLocation, setSearchLocation] = useState<string>('');

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setIsAuthenticated(!!token);
  }, []);

  // Handle search
  const handleSearch = () => {
    if (searchLocation.trim()) {
      onSearch(searchLocation);
    } else {
      alert('Please enter a valid location.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="navbar">
      {/* Logo */}
      <div className="logo" onClick={() => navigate('/')}>
        <img
            src={logo} // Path to your logo image
            alt="WeatherApp Logo"
            className="logo-image"
          />
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          placeholder="Enter location"
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
        <img
            src={searchIcon} // Path to your search icon
            alt="Search"
            className="search-icon"
          />
        </button>
      </div>

      {/* Auth/Profile Buttons */}
      <div className="auth-buttons">
        {!isAuthenticated ? (
          <>
            <button onClick={() => navigate('/login')} className="login-button">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="register-button">
              Register
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/profile')} className="profile-button">
              Profile
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;