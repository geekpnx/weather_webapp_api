import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from apps.weather.models.current import Current
from apps.weather.models.location import FavoriteLocation
from apps.weather.serializers.current import CurrentSerializer
from apps.user.models import UserProfile


class CurrentWeatherView(APIView):
    """Fetches current weather for a user's saved or searched location."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]  # Guests can access, but they can't save favorites

    def get(self, request, *args, **kwargs):
        # Check if a location is provided
        location_name = request.query_params.get('location', None)

        # If no location provided, use the user's saved location
        if not location_name and request.user.is_authenticated:
            user_profile = UserProfile.objects.filter(user=request.user).first()
            if user_profile and user_profile.location:
                location_name = user_profile.location
            else:
                return Response({'error': 'No location provided and no saved location found.'}, status=status.HTTP_400_BAD_REQUEST)

        if not location_name:
            return Response({'error': 'Please provide a location.'}, status=status.HTTP_400_BAD_REQUEST)

        api_key = os.getenv('OPENWEATHERMAP_API_KEY')
        url = f"http://api.openweathermap.org/data/2.5/weather?q={location_name}&appid={api_key}&units=metric"
        response = requests.get(url)

        if response.status_code == 200:
            return Response(response.json(), status=status.HTTP_200_OK)

        return Response({'error': f'Failed to fetch weather data for {location_name}.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
