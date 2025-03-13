import os
import requests
from datetime import datetime, timedelta
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.user.models import UserProfile
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

        # If no location or geolocation is provided, use the user's saved location
        if not location_name and not (lat and lon) and request.user.is_authenticated:
            user_profile = UserProfile.objects.filter(user=request.user).first()
            if user_profile and user_profile.location:
                location_name = user_profile.location
            else:
                return Response({'error': 'No location provided and no saved location found.'}, status=status.HTTP_400_BAD_REQUEST)

        if not location_name and not (lat and lon):
            return Response({'error': 'Please provide a location or geolocation coordinates.'}, status=status.HTTP_400_BAD_REQUEST)

        api_key = os.getenv('OPENWEATHERMAP_API_KEY')
        url = None

        # Build the API URL based on the provided input
        if location_name:
            url = f'http://api.openweathermap.org/data/2.5/forecast?q={location_name}&appid={api_key}&units=metric'
        elif lat and lon:
            url = f'http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric'
        else:
            return Response({'error': 'Invalid input. Please provide a location or geolocation coordinates.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            response = requests.get(url)

            # Handle invalid location response (e.g., "city not found")
            if response.status_code == 404:
                return Response({'error': f'Location "{location_name}" not found.'}, status=status.HTTP_404_NOT_FOUND)
            elif response.status_code != 200:
                return Response({'error': f'Failed to fetch forecast for {location_name or "geolocation"}.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Parse the OpenWeather API response
            data = response.json()
            forecast_data = []

            # Get today's date for comparison
            today = datetime.now().date()

            # Extract relevant data from the response
            for entry in data['list']:
                # Parse the datetime string from the API
                entry_datetime = datetime.strptime(entry['dt_txt'], '%Y-%m-%d %H:%M:%S')
                entry_date = entry_datetime.date()

                # Determine the day name
                if entry_date == today:
                    day_name = "Today"
                else:
                    day_name = entry_datetime.strftime('%A')  # Full day name (e.g., "Tuesday")

                forecast_data.append({
                    'day_name': day_name,
                    'datetime': entry['dt_txt'],
                    'temperature': entry['main']['temp'],
                    'weather_description': entry['weather'][0]['description'],
                    'humidity': entry['main']['humidity'],
                    'wind_speed': entry['wind']['speed'],
                })

            return Response(forecast_data, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            return Response({'error': f'Error fetching forecast data: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)