export interface ApiError {
  message: string;
  details?: string;
  profile_errors?: Record<string, string[]>;
  user_errors?: Record<string, string[]>;
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}


export interface NavBarProps {
  onSearch: (location: string) => void;
  onLogin: () => void;
  onRegister: () => void;
  favoriteLocations: string[]; 
  onAddFavorite?: (location: string) => void; 
}


export interface AuthContextType {
  isAuthenticated: boolean;
  authToken: string | null; // Add authToken to the context type
  userProfile: UserProfileData | null;
  login: () => void;
  logout: () => void;
  refreshProfile: (force?: boolean) => Promise<void>;
  updateFavorites: (newFavorites: string[]) => void;
  updateUserContext: (profileData: Partial<UserProfileData>) => void; // Add this line
}


export interface PreferencesContextType {
  temperatureUnit: 'C' | 'F';
  theme: 'light' | 'dark';
  toggleTemperatureUnit: () => void;
  toggleTheme: () => void;
  convertTemp: (temp: number) => number;
}


export interface WeatherDisplayProps {
  data: any;
  uvi?: number; 
  current?: {
    uvi?: number;
  };
  forecastData: any[];
}

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'settings';  
}

export interface ForecastDisplayProps {
  data: ForecastItem[];
}


export interface ForecastItem {
  dt: number; 
  day_name: string;
  date: string;
  uv_index: number;
  sunrise?: string;
  sunset?: string;
  forecasts: {
    datetime: string;
    temperature: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    weather_description: string;
    weather_icon: string;
    humidity: number;
    wind_speed: number;
  }[];
}


export interface NewsArticle {
    title: string;
    url: string;
    publishedAt: string;
    content: string;
    urlToImage: string | null;
  }


export interface NewsDisplayProps {
    articles: {
      title: string;
      url: string;
      publishedAt: string;
      content: string;
      urlToImage: string | null; // Add urlToImage to the interface
    }[];
  }


export interface UserProfileData {
  user: {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  profile_picture: string; // Add this line
  location: string;
  preferred_temperature_unit: 'C' | 'F';
  preferred_theme: string;
  favorite_locations?: string[]; // Add this line
}

export interface PreferencesData {
  preferred_temperature_unit: 'C' | 'F';
  preferred_theme: string;
}


export interface ProfilePictureResponse {
  profile_picture: string;
}


export interface MapComponentProps {
  lat: number;
  lon: number;
  zoom: number;
  boundary: [number, number][];
  layer: string;
  apiKey: string;
  onLayerChange: (layer: string) => void; // Add this line
}



export interface FavoriteLocation {
  id?: number;
  name: string;
  temp?: number;
  icon: string;
  weatherDescription?: string;
  country_code?: string;
  lat?: number;
  lon?: number;
}

export interface WeatherData {
  temp: number;
  icon: string;
  description: string;
}


export interface WeatherAlert {
  headline: string;
  msgtype: string;
  urgency: string;
  event: string;
  effective: string;
  desc: string;
  expires: string;
}