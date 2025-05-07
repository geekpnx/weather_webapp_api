
import { FavoriteLocation, ForecastItem } from '../types/types'; 
import { NewsArticle, WeatherAlert } from '../types/types'; 

const WEATHER_BASE_URL = import.meta.env.VITE_WEATHER_API_BASE_URL;
const OPENWEATHER_BASE_URL = import.meta.env.VITE_OPENWEATHERMAP_API_BASE_URL;

const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const fetchCoordinates = async (location: string): Promise<{ lat: number; lon: number }> => {
  try {
    const api_key = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
    if (!api_key) {
      throw new Error('OpenWeatherMap API key is not configured.');
    }

    const geo_url = `${OPENWEATHER_BASE_URL}/geo/1.0/direct?q=${location}&limit=1&appid=${api_key}`;
    const response = await fetch(geo_url);

    if (!response.ok) {
      throw new Error('Error fetching coordinates');
    }

    const geo_data = await response.json();
    if (geo_data && geo_data.length > 0) {
      const { lat, lon } = geo_data[0];
      return { lat, lon };
    } else {
      throw new Error(`Could not find coordinates for ${location}. Please check the city name.`);
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Error fetching coordinates');
    }
    throw new Error('Error fetching coordinates');
  }
};


export const fetchCurrentWeather = async (location?: string, lat?: number, lon?: number, unit: 'metric' | 'imperial' = 'metric') => {
  try {
    let url = `${WEATHER_BASE_URL}/current/`;


    if (location) {
      url += `?location=${location}&unit=${unit}`;
    } else if (lat !== undefined && lon !== undefined) {
      url += `?lat=${lat}&lon=${lon}&unit=${unit}`;
    } else {
      throw new Error('Please provide a location or geolocation coordinates.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error fetching current weather');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching current weather:", error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Error fetching current weather');
    } else {
      throw new Error('Error fetching current weather');
    }
  }
};


const fetchUVIndex = async (lat: number, lon: number): Promise<number> => {
  try {
    const api_key = import.meta.env.VITE_OPENWEATHERMAP_API_KEY; 
    if (!api_key) {
      throw new Error('OpenWeatherMap API key is not configured.');
    }

    const url = `${OPENWEATHER_BASE_URL}/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${api_key}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error fetching UV index data');
    }

    const data = await response.json();
    return data.value; // UV index value
  } catch (error) {
    console.error("Error fetching UV index:", error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Error fetching UV index data');
    } else {
      throw new Error('Error fetching UV index data');
    }
  }
};


export const fetchForecast = async (location?: string, lat?: number, lon?: number): Promise<ForecastItem[]> => {
  try {
    const api_key = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
    if (!api_key) {
      throw new Error('OpenWeatherMap API key is not configured.');
    }

    let url;
    if (location) {
      url = `${OPENWEATHER_BASE_URL}/data/2.5/forecast?q=${location}&appid=${api_key}&units=metric`;
    } else if (lat !== undefined && lon !== undefined) {
      url = `${OPENWEATHER_BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`;
    } else {
      throw new Error('Please provide a location or geolocation coordinates.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error fetching forecast data');
    }

    const data = await response.json();

 
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0]; 


    const uvIndex = await fetchUVIndex(data.city.coord.lat, data.city.coord.lon);


    const sunrise = data.city.sunrise ? new Date(data.city.sunrise * 1000).toLocaleTimeString() : undefined;
    const sunset = data.city.sunset ? new Date(data.city.sunset * 1000).toLocaleTimeString() : undefined;

 
    const groupedForecasts = data.list.reduce((acc: { [key: string]: any }, entry: any) => {
      const entryDate = new Date(entry.dt * 1000); 
      const entryDateString = entryDate.toISOString().split('T')[0];

      if (!acc[entryDateString]) {
        acc[entryDateString] = {
          day_name: entryDateString === todayDateString
            ? "Today"
            : entryDateString === new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              ? "Tomorrow"
              : entryDate.toLocaleDateString('en-US', { weekday: 'long' }), 
          date: entryDateString,
          uv_index: uvIndex,
          sunrise,
          sunset,
          forecasts: [], 
        };
      }

      acc[entryDateString].forecasts.push({
        datetime: entry.dt_txt, 
        temperature: entry.main.temp, 
        feels_like: entry.main.feels_like, 
        temp_min: entry.main.temp_min, 
        temp_max: entry.main.temp_max, 
        weather_description: entry.weather[0].description, 
        weather_icon: entry.weather[0].icon,
        humidity: entry.main.humidity, 
        wind_speed: entry.wind.speed, 
      });

      return acc;
    }, {});


    return Object.values(groupedForecasts);
  } catch (error) {
    console.error("Error fetching forecast:", error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Error fetching forecast data');
    } else {
      throw new Error('Error fetching forecast data');
    }
  }
};



export const fetchNews = async (location?: string): Promise<NewsArticle[]> => {
  try {
    const token = getAuthToken();
    if (!token) return [];

    const url = `${WEATHER_BASE_URL}/news/${location ? `?location=${encodeURIComponent(location)}` : ''}`;
    const response = await fetch(url, {
      headers: { 
        'Authorization': `Token ${token}`, 
        'Content-Type': 'application/json' 
      },
    });

    if (!response.ok) {
 
      if (response.status === 404) return [];

      if (response.status === 429) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'News API limit reached');
      }
      return []; 
    }

    const data = await response.json();
    return data.map((article: any) => ({
      title: article.title,
      url: article.url,
      publishedAt: article.publishedAt,
      content: article.content,
      urlToImage: article.urlToImage || null,
    }));
  } catch (error) {
    // Only log unexpected errors (not 404s)
    if (!(error instanceof Error) || !error.message.includes('404')) {
      console.error("News fetch error:", error);
    }
    return [];
  }
};


export const fetchRadarImage = async (
  lat: number,
  lon: number,
  zoom: number,
  layer: string
): Promise<{ imageUrl: string; center: { lat: number; lon: number }; boundary: [number, number][] }> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("User is not authenticated. Please log in.");

    const url = `${WEATHER_BASE_URL}/radar/?lat=${lat}&lon=${lon}&zoom=${zoom}&layer=${layer}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Token ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch map data');
    }

    const data = await response.json();
    return {
      imageUrl: data.image_url,
      center: data.center,
      boundary: data.boundary,
    };
  } catch (error) {
    console.error("Map fetch error:", error);
    throw new Error("Failed to fetch map data. Please try again later.");
  }
};

// Fetch user's favorite locations
export const fetchFavoriteLocations = async (): Promise<{
  favorites: Array<{
    city_name: string;
    country_code?: string;
    latitude: number;
    longitude: number;
  }>
}> => {
  const token = getAuthToken();
  if (!token) throw new Error('User is not authenticated. Please log in.');

  const response = await fetch(`${WEATHER_BASE_URL}/favorites/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  const data = await response.json();
  if (response.status === 200) {
    return data;
  } else {
    throw new Error(data.error || 'Unable to fetch favorite locations.');
  }
};



export const addToFavorites = async (city_name: string, country_code: string, latitude: number, longitude: number) => {
  const token = getAuthToken();
  if (!token) throw new Error('User is not authenticated. Please log in.');

  try {
    const response = await fetch(`${WEATHER_BASE_URL}/favorites/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({
        city_name,
        country_code: country_code || '',
        latitude,
        longitude
      }),
    });


    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      throw new Error(errorText || 'Invalid server response');
    }

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to add location to favorites');
    }

    return responseData;
  } catch (error) {
    console.error('Error in addToFavorites:', error);
    throw error;
  }
};


export const removeFromFavorites = async (favorite: FavoriteLocation) => {
  const token = getAuthToken();
  if (!token) throw new Error('User is not authenticated. Please log in.');

  const response = await fetch(`${WEATHER_BASE_URL}/favorites/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      city_name: favorite.name,
      country_code: favorite.country_code || '',
      latitude: favorite.lat || 0,
      longitude: favorite.lon || 0
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to remove location from favorites.');
  }

  return await response.json();
};

export const fetchWeatherAlerts = async (authToken: string, location?: string): Promise<WeatherAlert[]> => {
  try {
    let url = `${WEATHER_BASE_URL}/alerts/`;
    if (location) {
      url += `?location=${location}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error || 'Failed to fetch weather alerts');
    }

    const data = await response.json();


    if (response.status === 404 && data && data.error === 'No alerts found for your location!!!') {
      return [];
    }

    return data as WeatherAlert[];
  } catch (error: any) {
    console.error('Error fetching weather alerts:', error);
    throw error;
  }
};


export const searchCities = async (query: string): Promise<string[]> => {
  try {
    const api_key = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
    if (!api_key) {
      throw new Error('OpenWeatherMap API key is not configured.');
    }

    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/geo/1.0/direct?q=${query}&limit=5&appid=${api_key}`
    );

    if (!response.ok) {
      throw new Error('Error fetching city suggestions');
    }

    const data = await response.json();
    

    const uniqueCities = new Set<string>();
    
    return data
      .map((city: any) => {
        let name = city.name;
        if (city.state) name += `, ${city.state}`;
        if (city.country) name += `, ${city.country}`;
        return name;
      })

      .filter((city: string) => {
        if (!uniqueCities.has(city)) {
          uniqueCities.add(city);
          return true;
        }
        return false;
      });
  } catch (error) {
    console.error("Error fetching city suggestions:", error);
    return [];
  }
};