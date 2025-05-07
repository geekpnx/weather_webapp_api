import { UserProfileData, PreferencesData, ProfilePictureResponse, ApiError } from '../types/types';

const USER_BASE_URL = import.meta.env.VITE_USER_API_BASE_URL;


const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({}));
    const errorMessage = errorData.message ||
      errorData.details ||
      Object.entries(errorData.profile_errors || {})
        .flatMap(([field, errors]) => errors.map(e => `${field}: ${e}`))
        .join(', ') ||
      Object.entries(errorData.user_errors || {})
        .flatMap(([field, errors]) => errors.map(e => `${field}: ${e}`))
        .join(', ') ||
      'Incorrect Username and Password';
    throw new Error(errorMessage);
  }
  return response.json();
};


const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};


const getAuthHeader = (): { Authorization: string } => {
  const token = localStorage.getItem('auth_token');
  return { Authorization: `Token ${token}` };
};


export const addFavoriteLocation = async (location: string): Promise<UserProfileData> => {
  const response = await fetch(`${USER_BASE_URL}/favorites/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ location }),
  });
  return handleResponse<UserProfileData>(response);
};

export const removeFavoriteLocation = async (location: string): Promise<UserProfileData> => {
  const response = await fetch(`${USER_BASE_URL}/favorites/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ location }),
  });
  return handleResponse<UserProfileData>(response);
};


// Login user
export const loginUser = async (username: string, password: string) => {
  const response = await fetch(`${USER_BASE_URL}/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  return handleResponse<{ token: string }>(response).then(data => {
    localStorage.setItem('auth_token', data.token); 
    return data;
  });
};


export const registerUser = async (
  username: string,
  email: string,
  password: string,
  location: string,
  preferredTemperatureUnit: string
) => {
  const response = await fetch(`${USER_BASE_URL}/register/`, {
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

  return handleResponse<any>(response);
};


export const fetchUserProfile = async (): Promise<UserProfileData> => {
  const token = getAuthToken();
  if (!token) throw new Error('User is not authenticated. Please log in.');

  const response = await fetch(`${USER_BASE_URL}/profile/`, {
    headers: getAuthHeader(),
  });

  return handleResponse<UserProfileData>(response);
};


export const logoutUser = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('User is not authenticated. Please log in.');

  const response = await fetch(`${USER_BASE_URL}/logout/`, {
    method: 'POST',
    headers: getAuthHeader(),
  });

  return handleResponse<any>(response).then(data => {
    localStorage.removeItem('auth_token'); 
    return data;
  });
};


// Add this new function for account deletion
export const deleteAccount = async (password: string): Promise<boolean> => {
  const token = getAuthToken();
  if (!token) throw new Error('User is not authenticated. Please log in.');

  const response = await fetch(`${USER_BASE_URL}/profile/delete/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ password }),
  });

  if (response.status === 200) {
    localStorage.removeItem('auth_token');
    return true;
  } else {
    return handleResponse<any>(response).then(() => false); 
  }
};


export const updateUserProfile = async (data: Partial<UserProfileData>): Promise<UserProfileData> => {
  const response = await fetch(`${USER_BASE_URL}/profile/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse<UserProfileData>(response);
};

export const uploadProfilePicture = async (file: File): Promise<UserProfileData> => {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File size must be less than 2MB');
  }

  if (!file.type.match(/image\/(jpeg|png|gif)/)) {
    throw new Error('Only JPEG, PNG, and GIF images are allowed');
  }

  const formData = new FormData();
  formData.append('profile_picture', file);

  try {
    const response = await fetch(`${USER_BASE_URL}/profile/`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(errorText || 'Upload failed');
    }

    const data = await response.json();
    

    window.dispatchEvent(new CustomEvent('profile-updated', {
      detail: { newProfile: data }
    }));
    
    return data;
    
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const removeProfilePicture = async (): Promise<ProfilePictureResponse> => {
  const response = await fetch(`${USER_BASE_URL}/profile/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ remove_profile_picture: true }),
  });
  return handleResponse<ProfilePictureResponse>(response);
};

export const updatePreferences = async (preferences: Partial<PreferencesData>): Promise<PreferencesData> => {
  const response = await fetch(`${USER_BASE_URL}/profile/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(preferences),
  });
  return handleResponse<PreferencesData>(response);
};


export const updateTemperatureUnit = async (unit: 'C' | 'F'): Promise<PreferencesData> => {
  const response = await fetch(`${USER_BASE_URL}/profile/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ preferred_temperature_unit: unit }),
  });
  return handleResponse<PreferencesData>(response);
};



export const updateUserPreferences = async (preferences: {
  preferred_temperature_unit?: 'C' | 'F';
  preferred_theme?: 'light' | 'dark';
}): Promise<void> => {
  const token = getAuthToken();
  if (!token) throw new Error('User is not authenticated');


  let method = 'PATCH';
  let response = await fetch(`${USER_BASE_URL}/profile/`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(preferences),
  });


  if (response.status === 405) {
    method = 'PUT';
    response = await fetch(`${USER_BASE_URL}/profile/`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(preferences),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to update preferences');
  }

  return await response.json();
};