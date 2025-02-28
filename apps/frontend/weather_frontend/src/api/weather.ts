const BASE_URL = 'http://127.0.0.1:8000/api/v1/weather'; // Django backend URL

// Fetch current weather
export const fetchCurrentWeather = async (location: string) => {
  const response = await fetch(`${BASE_URL}/current/?location=${location}`);
  const data = await response.json();
  return data;
};

// Fetch forecast
export const fetchForecast = async (location: string) => {
  const response = await fetch(`${BASE_URL}/forecast/?location=${location}`);
  const data = await response.json();
  return data;
};
