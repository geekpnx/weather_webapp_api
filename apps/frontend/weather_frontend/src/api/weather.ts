const BASE_URL = 'http://localhost:8000/api/v1/weather'; // Django backend URL

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
