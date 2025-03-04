import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for redirect
import { fetchCurrentWeather, fetchForecast, fetchFavoriteLocations, addToFavorites, removeFromFavorites } from '../api/weather';
import { fetchUserProfile, logoutUser } from '../api/user';
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

  // Fetch user profile (including location and preferred temperature unit)
  const fetchUserProfileData = async () => {
    try {
      const data = await fetchUserProfile();
      setLocation(data.location);
      setPreferredTemperatureUnit(data.preferred_temperature_unit);
      fetchWeatherData(data.location);
    } catch (error) {
      setError('Unable to fetch user profile.');
    }
  };

  // Fetch user's favorite locations
  const fetchFavoriteLocationsData = async () => {
    try {
      const data = await fetchFavoriteLocations();
      setFavorites(data);
    } catch (error) {
      setError('Unable to fetch favorite locations.');
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

  // Redirect if no token exists
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/');  // Redirect to homepage if not authenticated
    } else {
      fetchUserProfileData(); // Call the function to fetch user profile
      fetchFavoriteLocationsData(); // Call the function to fetch favorite locations
    }
  }, [navigate]);

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
      try {
        await addToFavorites(searchLocation, country_code, latitude, longitude);
        alert('Location added to favorites!');
        fetchFavoriteLocationsData(); // Refresh the list of favorites
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to add location to favorites.');
      }
    }
  };

  // Handle deleting a location from favorites
  const handleDeleteFavorite = async (city_name: string, country_code: string, latitude: number, longitude: number) => {
    try {
      await removeFromFavorites(city_name, country_code, latitude, longitude);
      alert('Location removed from favorites!');
      fetchFavoriteLocationsData(); // Refresh the list of favorites
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove location from favorites.');
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      alert('Logged out successfully!');
      navigate('/'); // Redirect to homepage
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to log out.');
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