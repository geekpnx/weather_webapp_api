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

// Fetch current weather
export const fetchCurrentWeather = async (location: string) => {
  try {
    const response = await fetch(`${BASE_URL}/current/?location=${location}`);
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

// Fetch forecast
export const fetchForecast = async (location: string) => {
  try {
    const response = await fetch(`${BASE_URL}/forecast/?location=${location}`);
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
export const fetchRadarImage = async (): Promise<string> => {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("User is not authenticated. Please log in.");

    const response = await fetch(`${BASE_URL}/radar/`, {
      headers: { 'Authorization': `Token ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch radar image");
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Radar fetch error:", error);
    throw new Error("Failed to fetch radar image");
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