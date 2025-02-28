import os
import requests
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.user.models import UserProfile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class ForecastListView(APIView):
    """Fetches 7-day weather forecast for any location."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]  # Guests can view forecasts

    def get(self, request, *args, **kwargs):
        location_name = request.query_params.get('location', None)

        # If no location is provided, use the user's saved location
        if not location_name and request.user.is_authenticated:
            user_profile = UserProfile.objects.filter(user=request.user).first()
            if user_profile and user_profile.location:
                location_name = user_profile.location
            else:
                return Response({'error': 'No location provided and no saved location found.'}, status=status.HTTP_400_BAD_REQUEST)

        if not location_name:
            return Response({'error': 'Please provide a location.'}, status=status.HTTP_400_BAD_REQUEST)

        api_key = os.getenv('WEATHERBIT_API_KEY')
        url = f'https://api.weatherbit.io/v2.0/forecast/daily?city={location_name}&key={api_key}'
        
        try:
            response = requests.get(url)

            # Handle invalid location response (e.g., "city not found")
            if response.status_code == 404:
                return Response({'error': f'Location "{location_name}" not found.'}, status=status.HTTP_404_NOT_FOUND)
            elif response.status_code != 200:
                return Response({'error': f'Failed to fetch forecast for {location_name}.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response(response.json(), status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            return Response({'error': f'Error fetching forecast data: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
