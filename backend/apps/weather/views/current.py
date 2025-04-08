import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny
from apps.user.models import UserProfile

class CurrentWeatherView(APIView):
    """Fetches current weather with UV index for a location"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        # Get location parameters
        location_name = request.query_params.get('location')
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        unit = request.query_params.get('unit', 'metric')
        api_key = os.getenv('OPENWEATHERMAP_API_KEY')

        if unit not in ['metric', 'imperial']:
            unit = 'metric'

        # Fallback to user's saved location if authenticated
        if not location_name and not (lat and lon) and request.user.is_authenticated:
            user_profile = UserProfile.objects.filter(user=request.user).first()
            if user_profile and user_profile.location:
                location_name = user_profile.location
            else:
                return Response(
                    {'error': 'No location provided and no saved location found.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Get coordinates if location name is provided
        if location_name and not (lat and lon):
            try:
                geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={location_name}&limit=1&appid={api_key}"
                geo_response = requests.get(geo_url)
                if geo_response.status_code == 200 and geo_response.json():
                    geo_data = geo_response.json()[0]
                    lat, lon = geo_data['lat'], geo_data['lon']
            except Exception as e:
                return Response(
                    {'error': f'Error getting coordinates: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        if not (lat and lon):
            return Response(
                {'error': 'Could not determine location coordinates.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get current weather
            weather_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units={unit}"
            weather_response = requests.get(weather_url)
            
            if weather_response.status_code != 200:
                return Response(
                    {'error': 'Failed to fetch weather data'},
                    status=weather_response.status_code
                )

            weather_data = weather_response.json()

            # Get UV index
            uv_url = f"http://api.openweathermap.org/data/2.5/uvi?lat={lat}&lon={lon}&appid={api_key}"
            uv_response = requests.get(uv_url)
            uv_data = uv_response.json() if uv_response.status_code == 200 else {'value': None}

            # Combine responses
            combined_data = {
                **weather_data,
                'uvi': uv_data.get('value'),
                'unit': unit 
            }

            return Response(combined_data, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'Error fetching weather data: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        