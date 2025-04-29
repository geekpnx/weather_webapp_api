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