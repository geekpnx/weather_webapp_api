import os
import requests
from datetime import datetime, timedelta
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ForecastListView(APIView):
    """Fetches 3-hour 5-day weather forecast for any location or geolocation."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]  # Guests can view forecasts

    def get(self, request, *args, **kwargs):
        location_name = request.query_params.get('location', None)
        lat = request.query_params.get('lat', None)
        lon = request.query_params.get('lon', None)
        unit = request.query_params.get('unit', 'metric')
        api_key = os.getenv('OPENWEATHERMAP_API_KEY')

        if unit not in ['metric', 'imperial']:
            unit = 'metric'

        # If no location or geolocation is provided, use the user's saved location
        if not location_name and not (lat and lon) and request.user.is_authenticated:
            user_profile = request.user.userprofile
            if user_profile and user_profile.location:
                location_name = user_profile.location
            else:
                return Response({'error': 'No location provided and no saved location found.'}, status=status.HTTP_400_BAD_REQUEST)

        if not location_name and not (lat and lon):
            return Response({'error': 'Please provide a location or geolocation coordinates.'}, status=status.HTTP_400_BAD_REQUEST)

        
        url = None

        # Build the API URL based on the provided input
        try:
            # Build the API URL with the specified unit
            if location_name:
                url = f'http://api.openweathermap.org/data/2.5/forecast?q={location_name}&appid={api_key}&units={unit}'
            elif lat and lon:
                url = f'http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units={unit}'
            else:
                return Response(
                    {'error': 'Invalid input. Please provide a location or geolocation coordinates.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            response = requests.get(url)
            
            if response.status_code == 404:
                return Response(
                    {'error': f'Location "{location_name}" not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            elif response.status_code != 200:
                return Response(
                    {'error': f'Failed to fetch forecast for {location_name or "geolocation"}.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            data = response.json()
            forecast_data = []
            today = datetime.now().date()

            for entry in data['list']:
                entry_datetime = datetime.strptime(entry['dt_txt'], '%Y-%m-%d %H:%M:%S')
                entry_date = entry_datetime.date()

                if entry_date == today:
                    day_name = "Today"
                else:
                    day_name = entry_datetime.strftime('%A')

                forecast_data.append({
                    'day_name': day_name,
                    'datetime': entry['dt_txt'],
                    'temperature': entry['main']['temp'],
                    'feels_like': entry['main']['feels_like'],
                    'temp_min': entry['main']['temp_min'],
                    'temp_max': entry['main']['temp_max'],
                    'weather_description': entry['weather'][0]['description'],
                    'weather_icon': entry['weather'][0]['icon'],
                    'humidity': entry['main']['humidity'],
                    'wind_speed': entry['wind']['speed'],
                    'unit': unit  # Include the unit in the response
                })

            return Response(forecast_data, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            return Response({'error': f'Error fetching forecast data: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)