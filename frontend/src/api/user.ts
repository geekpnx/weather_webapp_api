import { UserProfileData, PreferencesData, ProfilePictureResponse } from '../types/types';

const BASE_URL = 'http://127.0.0.1:8000/api/v1/user'; // Base URL for user-related endpoints


// Add proper error handling interface
interface ApiError {
  message: string;
  details?: string;
  profile_errors?: Record<string, string[]>;
  user_errors?: Record<string, string[]>;
}

// Enhanced response handler
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || 
      errorData.details ||
      Object.entries(errorData.profile_errors || {})
        .flatMap(([field, errors]) => errors.map(e => `${field}: ${e}`))
        .join(', ') ||
      'Request failed';
    throw new Error(errorMessage);
  }
  return response.json();
};


// Helper function to get the authentication token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};


const getAuthHeader = (): { Authorization: string } => {
  const token = localStorage.getItem('auth_token');
  return { Authorization: `Token ${token}` };
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


// Add this new function for account deletion
export const deleteAccount = async (password: string) => {
  const token = getAuthToken();
  if (!token) throw new Error('User is not authenticated. Please log in.');

  const response = await fetch(`${BASE_URL}/profile/delete/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ password }),
  });

  if (response.status === 200) {
    localStorage.removeItem('auth_token');
    return true;
  } else {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete account.');
  }
};

// Update API functions to use the single handleResponse
export const updateUserProfile = async (data: UserProfileData): Promise<UserProfileData> => {
  const response = await fetch(`${BASE_URL}/profile/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse<UserProfileData>(response);
};

export const uploadProfilePicture = async (file: File): Promise<ProfilePictureResponse> => {
  const formData = new FormData();
  formData.append('profile_picture', file);

  const response = await fetch(`${BASE_URL}/profile/`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: formData,
  });
  return handleResponse<ProfilePictureResponse>(response);
};

export const removeProfilePicture = async (): Promise<ProfilePictureResponse> => {
  const response = await fetch(`${BASE_URL}/profile/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ remove_profile_picture: true }),
  });
  return handleResponse<ProfilePictureResponse>(response);
};

export const updatePreferences = async (preferences: PreferencesData): Promise<PreferencesData> => {
  const response = await fetch(`${BASE_URL}/profile/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(preferences),
  });
  return handleResponse<PreferencesData>(response);
};
