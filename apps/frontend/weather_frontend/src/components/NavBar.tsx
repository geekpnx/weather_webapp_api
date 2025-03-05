import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../static/css/NavBar.css'; // Import the CSS file

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
        WeatherApp
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
          Search
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