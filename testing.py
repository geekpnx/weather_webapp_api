OpenWeatherAPI = 
{"coord":{"lon":-0.1257,"lat":51.5085},
 "weather":[{"id":804,
             "main":"Clouds",
             "description":"overcast clouds",
             "icon":"04d"}],
 "base":"stations",
 "main":{"temp":292,
         "feels_like":292.03,
         "temp_min":290.79,
         "temp_max":292.91,
         "pressure":1006,
         "humidity":80,
         "sea_level":1006,
         "grnd_level":1002},
 "visibility":10000,
 "wind":{"speed":5.36,
         "deg":187,
         "gust":8.05},
 "clouds":{"all":100},
 "dt":1724328769,
 "sys":{"type":2,
        "id":2075535,
        "country":"GB",
        "sunrise":1724302670,
        "sunset":1724353752},
  "timezone":3600,
  "id":2643743,
  "name":"London",
  "cod":200}


# example Current
current_data = {
    "location": 1,
     "timestamp": "2024-08-21T14:30:00Z", 
     "temperature": 25.5,
     "humidity": 60,
     "wind_speed": 15.2
     }


# Example Forecast

forecast_data = {
    "location": 1, 
    "timestamp": "2024-08-21T14:30:00Z",
    "temperature": 25.5,
    "max_temperature": 28.0,
    "min_temperature": 18.0,
    "humidity": 60,
    "weather_description": "Partly cloudy"
    }

# Example Location

location_data = {
    "city_name":"Cologne", 
    "country_code":"de", 
    "latitude":50.935173, 
    "longitude":6.953101
    }
