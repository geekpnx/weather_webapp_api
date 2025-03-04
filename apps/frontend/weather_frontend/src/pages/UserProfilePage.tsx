import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentWeather, fetchForecast, fetchFavoriteLocations, addToFavorites, removeFromFavorites } from '../api/weather';
import { fetchUserProfile } from '../api/user'; // Only import fetchUserProfile (logoutUser is handled in NavBar)
import WeatherDisplay from '../components/WeatherDisplay';
import ForecastDisplay from '../components/ForecastDisplay';
import NavBar from '../components/NavBar'; // Import the new NavBar

const UserProfilePage = () => {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [location, setLocation] = useState<string>('');
  const [country_code, setCountryCode] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [preferredTemperatureUnit, setPreferredTemperatureUnit] = useState<string>('C');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch weather data for the given location
  const fetchWeatherData = async (location: string) => {
    try {
      const current = await fetchCurrentWeather(location); // Use fetchCurrentWeather
      const forecastData = await fetchForecast(location); // Use fetchForecast
      setCurrentWeather(current);
      setForecast(forecastData.data);
      setLatitude(current.coord.lat);
      setLongitude(current.coord.lon);
      setCountryCode(current.sys.country);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        setError(`Location "${location}" not found. Please try again.`);
      } else {
        setError('Unable to fetch weather data.');
      }
      setCurrentWeather(null);
      setForecast([]);
    }
  };

  // Fetch user profile and favorite locations
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/');
    } else {
      fetchUserProfile()
        .then((data) => {
          setLocation(data.location);
          setPreferredTemperatureUnit(data.preferred_temperature_unit);
          fetchWeatherData(data.location); // Fetch weather data for the user's location
        })
        .catch(() => setError('Unable to fetch user profile.'));

      fetchFavoriteLocations()
        .then(setFavorites)
        .catch(() => setError('Unable to fetch favorite locations.'));
    }
  }, [navigate]);

  // Handle search for a new location
  const handleSearch = async (location: string) => {
    if (location) {
      try {
        await fetchWeatherData(location);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch weather data.');
      }
    }
  };

  // Handle adding a location to favorites
  const handleAddToFavorites = async () => {
    if (searchLocation && country_code && latitude && longitude) {
      try {
        await addToFavorites(searchLocation, country_code, latitude, longitude); // Use addToFavorites
        alert('Location added to favorites!');
        const updatedFavorites = await fetchFavoriteLocations(); // Refresh the list of favorites
        setFavorites(updatedFavorites);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to add location to favorites.');
      }
    }
  };

  // Handle removing a location from favorites
  const handleDeleteFavorite = async (city_name: string, country_code: string, latitude: number, longitude: number) => {
    try {
      await removeFromFavorites(city_name, country_code, latitude, longitude); // Use removeFromFavorites
      alert('Location removed from favorites!');
      const updatedFavorites = await fetchFavoriteLocations(); // Refresh the list of favorites
      setFavorites(updatedFavorites);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove location from favorites.');
    }
  };

  return (
    <div>
      {/* NavBar */}
      <NavBar onSearch={handleSearch} />

      {/* Page Content */}
      <h1>User Profile</h1>
      {error && <p>{error}</p>}

      <h2>Your Location: {location}</h2>
      <h3>Preferred Temperature Unit: {preferredTemperatureUnit === 'C' ? 'Celsius' : 'Fahrenheit'}</h3>

      {/* Display current weather and forecast */}
      {currentWeather && <WeatherDisplay title="Current Weather" data={currentWeather} />}
      {forecast.length > 0 && <ForecastDisplay data={forecast} />}

      {/* Search for a new location */}
      <div>
        <h3>Search for a new location:</h3>
        <input
          type="text"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          placeholder="Enter city"
        />
        <button onClick={() => handleSearch(searchLocation)}>Search</button>
      </div>

      {/* Add to favorites */}
      {searchLocation && country_code && latitude && longitude && (
        <div>
          <h3>{searchLocation}</h3>
          <button onClick={handleAddToFavorites}>Add to Favorites</button>
        </div>
      )}

      {/* Display favorite locations */}
      <h3>Your Favorite Locations:</h3>
      {favorites.length > 0 ? (
        <ul>
          {favorites.map((fav) => (
            <li key={fav.id} style={{ cursor: 'pointer' }} onClick={() => handleSearch(fav.city_name)}>
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
    </div>
  );
};

export default UserProfilePage;