import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f0f0f0' }}>
      {/* Logo */}
      <div style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>
        WeatherApp
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          placeholder="Enter location"
          style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button onClick={handleSearch} style={{ padding: '5px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: '#fff' }}>
          Search
        </button>
      </div>

      {/* Auth/Profile Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {!isAuthenticated ? (
          <>
            <button onClick={() => navigate('/login')} style={{ padding: '5px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: '#fff' }}>
              Login
            </button>
            <button onClick={() => navigate('/register')} style={{ padding: '5px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#17a2b8', color: '#fff' }}>
              Register
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/profile')} style={{ padding: '5px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#ffc107', color: '#000' }}>
              Profile
            </button>
            <button onClick={handleLogout} style={{ padding: '5px 10px', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: '#fff' }}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar;