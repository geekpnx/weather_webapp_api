import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.user.models import UserProfile

class CurrentWeatherView(APIView):
    """Fetches current weather for a user's saved location, searched location, or geolocation."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]  # Guests can access, but they can't save favorites

    def get(self, request, *args, **kwargs):
        # Check if a location name or geolocation is provided
        location_name = request.query_params.get('location', None)
        lat = request.query_params.get('lat', None)
        lon = request.query_params.get('lon', None)

        # If no location or geolocation provided, use the user's saved location
        if not location_name and not (lat and lon) and request.user.is_authenticated:
            user_profile = UserProfile.objects.filter(user=request.user).first()
            if user_profile and user_profile.location:
                location_name = user_profile.location
            else:
                return Response({'error': 'No location provided and no saved location found.'}, status=status.HTTP_400_BAD_REQUEST)

        api_key = os.getenv('OPENWEATHERMAP_API_KEY')
        url = None

        # Build the API URL based on the provided input
        if location_name:
            url = f"http://api.openweathermap.org/data/2.5/weather?q={location_name}&appid={api_key}&units=metric"
        elif lat and lon:
            url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        else:
            return Response({'error': 'Please provide a location or geolocation.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            response = requests.get(url)

            # Handle invalid location response (e.g., "city not found")
            if response.status_code == 404:
                return Response({'error': f'Location "{location_name}" not found.'}, status=status.HTTP_404_NOT_FOUND)
            elif response.status_code != 200:
                return Response({'error': f'Failed to fetch weather data for {location_name or "geolocation"}.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response(response.json(), status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            return Response({'error': f'Error fetching weather data: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)