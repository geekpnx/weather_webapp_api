export interface ForecastItem {
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
    favorite_locations: string[]; // Add this line
  }
  
  export interface PreferencesData {
    preferred_temperature_unit: 'C' | 'F';
    preferred_theme: string;
  }


  export interface ProfilePictureResponse {
    profile_picture: string;
  }
  