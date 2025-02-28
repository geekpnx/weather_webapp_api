import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for redirect
import { fetchCurrentWeather, fetchForecast } from '../api/weather';
import WeatherDisplay from '../components/WeatherDisplay';
import ForecastDisplay from '../components/ForecastDisplay';

const UserProfilePage = () => {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [location, setLocation] = useState<string>('');
  const [country_code, setCountryCode] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [preferredTemperatureUnit, setPreferredTemperatureUnit] = useState<string>('C');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [favorites, setFavorites] = useState<any[]>([]); // State for favorite locations
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();  // Hook for redirecting after logout

  // Redirect if no token exists
  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    if (!token) {
      navigate('/');  // Redirect to homepage if not authenticated
    } else {
      fetchUserProfile();
      fetchFavoriteLocations();
    }
  }, [navigate]);

  // Fetch user profile (including location and preferred temperature unit)
  const fetchUserProfile = async () => {
    const response = await fetch('http://localhost:8000/api/v1/user/profile/', {
      headers: {
        'Authorization': `Token ${sessionStorage.getItem('auth_token')}`,
      },
    });

    const data = await response.json();
    if (response.status === 200) {
      setLocation(data.location);
      setPreferredTemperatureUnit(data.preferred_temperature_unit);
      fetchWeatherData(data.location);
    } else {
      setError('Unable to fetch user profile.');
    }
  };

  // Fetch weather data for the given location
  const fetchWeatherData = async (location: string) => {
    try {
      const current = await fetchCurrentWeather(location);
      const forecastData = await fetchForecast(location);
      setCurrentWeather(current);
      setForecast(forecastData.data);
      setLatitude(current.coord.lat);
      setLongitude(current.coord.lon);
      setCountryCode(current.sys.country);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        setError(`Location "${location}" not found. Please try again.`);
      } else {
        setError('Unable to fetch weather data.');
      }
      setCurrentWeather(null);
      setForecast([]);
    }
  };
  
  
  // Fetch user's favorite locations
  const fetchFavoriteLocations = async () => {
    const response = await fetch('http://localhost:8000/api/v1/weather/favorites/', {
      headers: {
        'Authorization': `Token ${sessionStorage.getItem('auth_token')}`,
      },
    });
    const data = await response.json();
    if (response.status === 200) {
      setFavorites(data);
    } else {
      setError('Unable to fetch favorite locations.');
    }
  };

  // Handle search for new location
  const handleSearch = async () => {
    if (searchLocation) {
      try {
        await fetchWeatherData(searchLocation);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message || 'Failed to fetch weather data');
        } else {
          setError('Failed to fetch weather data');
        }
      }
    }
  };
  

  // Handle adding location to favorites
  const handleAddToFavorites = async () => {
    if (searchLocation && country_code && latitude && longitude) {
      // Check if location already exists in favorites
      const response = await fetch('http://localhost:8000/api/v1/weather/favorites/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${sessionStorage.getItem('auth_token')}`,
        },
      });
      
      const data = await response.json();
  
      // Check if location is already in favorites
      const alreadyFavorite = data.some(
        (fav: any) => fav.city_name === searchLocation && fav.country_code === country_code
      );
  
      if (alreadyFavorite) {
        alert('This location is already in your favorites!');
        return;
      }
  
      // If not in favorites, proceed to add
      const city_name = searchLocation;
      const addResponse = await fetch('http://localhost:8000/api/v1/weather/favorites/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${sessionStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          city_name: city_name,
          country_code: country_code,
          latitude: latitude,
          longitude: longitude,
        }),
      });
  
      const addData = await addResponse.json();
      if (addResponse.status === 201) {
        alert('Location added to favorites!');
        fetchFavoriteLocations(); // Refresh the list of favorites
      } else {
        alert(addData.message || 'Failed to add location to favorites.');
      }
    }
  };

  // Handle deleting a location from favorites
  const handleDeleteFavorite = async (city_name: string, country_code: string, latitude: number, longitude: number) => {
    const response = await fetch('http://localhost:8000/api/v1/weather/favorites/', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${sessionStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({
        city_name: city_name,
        country_code: country_code,
        latitude: latitude,
        longitude: longitude,
      }),
    });
  
    if (response.status === 200) {
      alert('Location removed from favorites!');
      fetchFavoriteLocations(); // Refresh the list of favorites
    } else {
      const data = await response.json();
      setError(data.error || 'Failed to remove location from favorites.');
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    const response = await fetch('http://localhost:8000/api/v1/user/logout/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${sessionStorage.getItem('auth_token')}`,
      },
    });

    const data = await response.json();
    if (response.status === 200) {
      // Remove the token from sessionStorage and redirect to homepage
      sessionStorage.removeItem('auth_token');
      alert(data.message); // Logout success message
      navigate('/'); // Redirect to homepage
    } else {
      alert(data.error || 'Failed to log out.');
    }
  };

  // Handle click on a favorite location
  const handleClickFavoriteLocation = (city_name: string) => {
    fetchWeatherData(city_name); // Fetch weather data for the clicked favorite location
  };

  return (
    <div>
      <h1>User Profile</h1>
      {error && <p>{error}</p>}

      <h2>Your Location: {location}</h2>
      <h3>Preferred Temperature Unit: {preferredTemperatureUnit === 'C' ? 'Celsius' : 'Fahrenheit'}</h3>

      {/* Display current weather and forecast */}
      {currentWeather && <WeatherDisplay title="Current Weather" data={currentWeather} />}
      {forecast.length > 0 && <ForecastDisplay data={forecast} />}

      {/* Display search bar */}
      <div>
        <h3>Search for a new location:</h3>
        <input
          type="text"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          placeholder="Enter city"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Display the option to add the location to favorites */}
      {searchLocation && country_code && latitude && longitude && (
        <div>
          <h3>{searchLocation}</h3>
          <button onClick={handleAddToFavorites}>Add to Favorites</button>
        </div>
      )}

      {/* Display user's favorite locations */}
      <h3>Your Favorite Locations:</h3>
      {favorites.length > 0 ? (
        <ul>
          {favorites.map((fav: any) => (
            <li key={fav.id} style={{ cursor: 'pointer' }} onClick={() => handleClickFavoriteLocation(fav.city_name)}>
              {fav.city_name}, {fav.country_code}
              <button onClick={() => handleDeleteFavorite(fav.city_name, fav.country_code, fav.latitude, fav.longitude)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No favorite locations added yet.</p>
      )}

      {/* Logout Button */}
      <div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default UserProfilePage;
