const BASE_URL = 'http://127.0.0.1:8000/api/v1/user'; // Base URL for user-related endpoints

// Helper function to get the authentication token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Login user
export const loginUser = async (username: string, password: string) => {
  const response = await fetch(`${BASE_URL}/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (response.status === 200) {
    localStorage.setItem('auth_token', data.token); // Store token in localStorage
    return data;
  } else {
    throw new Error(data.error || 'Login failed. Please check your credentials.');
  }
};

// Register user
export const registerUser = async (
  username: string,
  email: string,
  password: string,
  location: string,
  preferredTemperatureUnit: string
) => {
  const response = await fetch(`${BASE_URL}/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
      location,
      preferred_temperature_unit: preferredTemperatureUnit,
    }),
  });

  const data = await response.json();
  if (response.status === 201) {
    return data;
  } else {
    throw new Error(data.error || 'Registration failed. Please try again.');
  }
};

// Fetch user profile
export const fetchUserProfile = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('User is not authenticated. Please log in.');

  const response = await fetch(`${BASE_URL}/profile/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  const data = await response.json();
  if (response.status === 200) {
    return data;
  } else {
    throw new Error(data.error || 'Unable to fetch user profile.');
  }
};

// Logout user
export const logoutUser = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('User is not authenticated. Please log in.');

  const response = await fetch(`${BASE_URL}/logout/`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  const data = await response.json();
  if (response.status === 200) {
    localStorage.removeItem('auth_token'); // Remove token from localStorage
    return data;
  } else {
    throw new Error(data.error || 'Failed to log out.');
  }
};
