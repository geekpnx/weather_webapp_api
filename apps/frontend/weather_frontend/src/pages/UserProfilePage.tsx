import { useState, useEffect } from 'react';
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
      alert('Unable to fetch user profile.');
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
    } catch (err) {
      alert('Unable to fetch weather data.');
    }
  };

  // Handle search for new location
  const handleSearch = async () => {
    if (searchLocation) {
      await fetchWeatherData(searchLocation);
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
      } else {
        alert(addData.message || 'Failed to add location to favorites.');
      }
    }
  };
  
  

  // On page load, fetch user profile
  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <div>
      <h1>User Profile</h1>
      

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
    </div>
  );
};

export default UserProfilePage;
