interface NewsArticle {
  title: string;
  url: string;
  publishedAt: string;
  content: string;
  urlToImage: string | null;
}

const BASE_URL = 'http://127.0.0.1:8000/api/v1/weather'; // Django backend URL

// Helper function to get the authentication token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Fetch coordinates (latitude and longitude) for a given city name
export const fetchCoordinates = async (location: string): Promise<{ lat: number; lon: number }> => {
  try {
    const api_key = import.meta.env.VITE_OPENWEATHERMAP_API_KEY; // For Vite
    // const api_key = process.env.REACT_APP_OPENWEATHERMAP_API_KEY; // For Create React App
    if (!api_key) {
      throw new Error('OpenWeatherMap API key is not configured.');
    }

    const geo_url = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${api_key}`;
    const response = await fetch(geo_url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error fetching coordinates');
    }

    const geo_data = await response.json();
    if (geo_data && geo_data.length > 0) {
      const { lat, lon } = geo_data[0];
      return { lat, lon };
    } else {
      throw new Error(`Could not determine coordinates for ${location}.`);
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Error fetching coordinates');
    } else {
      throw new Error('Error fetching coordinates');
    }
  }
};

// Fetch current weather by location name or geolocation
export const fetchCurrentWeather = async (location?: string, lat?: number, lon?: number) => {
  try {
    let url = `${BASE_URL}/current/`;
    if (location) {
      url += `?location=${location}`;
    } else if (lat !== undefined && lon !== undefined) {
      url += `?lat=${lat}&lon=${lon}`;
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

// Fetch forecast by location name or geolocation
export const fetchForecast = async (location?: string, lat?: number, lon?: number) => {
  try {
    let url = `${BASE_URL}/forecast/`;
    if (location) {
      url += `?location=${location}`;
    } else if (lat !== undefined && lon !== undefined) {
      url += `?lat=${lat}&lon=${lon}`;
    } else {
      throw new Error('Please provide a location or geolocation coordinates.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error fetching forecast data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching forecast:", error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Error fetching forecast data');
    } else {
      throw new Error('Error fetching forecast data');
    }
  }
};

// Fetch news articles
export const fetchNews = async (): Promise<NewsArticle[]> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("User is not authenticated. Please log in.");

    const response = await fetch(`${BASE_URL}/news/`, {
      headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch news");
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
    console.error("News fetch error:", error);
    throw new Error("Failed to fetch news");
  }
};

// Fetch radar image
export const fetchRadarImage = async (lat?: number, lon?: number, zoom?: number, layer?: string): Promise<string> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("User is not authenticated. Please log in.");

    let url = `${BASE_URL}/radar/`;
    if (lat !== undefined && lon !== undefined && zoom !== undefined) {
      url += `?lat=${lat}&lon=${lon}&zoom=${zoom}`;
      if (layer) {
        url += `&layer=${layer}`;
      }
    }

    const response = await fetch(url, {
      headers: { 'Authorization': `Token ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch map image');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Map fetch error:", error);
    throw new Error("Failed to fetch map image. Please try again later.");
  }
};

// Fetch user's favorite locations
export const fetchFavoriteLocations = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('User is not authenticated. Please log in.');

  const response = await fetch(`${BASE_URL}/favorites/`, {
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

// Add location to favorites
export const addToFavorites = async (city_name: string, country_code: string, latitude: number, longitude: number) => {
  const token = getAuthToken();
  if (!token) throw new Error('User is not authenticated. Please log in.');

  const response = await fetch(`${BASE_URL}/favorites/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      city_name,
      country_code,
      latitude,
      longitude,
    }),
  });

  const data = await response.json();
  if (response.status === 201) {
    return data;
  } else {
    throw new Error(data.error || 'Failed to add location to favorites.');
  }
};

// Remove location from favorites
export const removeFromFavorites = async (city_name: string, country_code: string, latitude: number, longitude: number) => {
  const token = getAuthToken();
  if (!token) throw new Error('User is not authenticated. Please log in.');

  const response = await fetch(`${BASE_URL}/favorites/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      city_name,
      country_code,
      latitude,
      longitude,
    }),
  });

  const data = await response.json();
  if (response.status === 200) {
    return data;
  } else {
    throw new Error(data.error || 'Failed to remove location from favorites.');
  }
};