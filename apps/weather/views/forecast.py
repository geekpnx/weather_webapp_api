from django.utils import timezone
from apps.user.models import UserProfile
from apps.weather.models import Forecast, Location
from apps.weather.serializers.forecast import ForecastSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
import os
from django.shortcuts import get_object_or_404

class ForecastListView(APIView):
    def get(self, request, *args, **kwargs):
        # Check if the user is authenticated and has a UserProfile
        user = request.user
        location_name = 'Hamburg'  # Default location
        
        # Get the user's location from UserProfile if it exists
        if user.is_authenticated:
            user_profile = UserProfile.objects.filter(user=user).first()
            if user_profile and user_profile.location:
                location_name = user_profile.location
        
        api_key = os.getenv('WEATHERBIT_API_KEY')  # Use environment variable for API key
        url = f'https://api.weatherbit.io/v2.0/forecast/daily?city={location_name}&key={api_key}'
        response = requests.get(url)
        
        if response.status_code == 200:
            forecast_data = response.json()

            # Ensure no duplicate locations are created based on city and country combination
            location, _ = Location.objects.get_or_create(
                city_name=forecast_data['city_name'],
                country_code=forecast_data['country_code'],
                user=user
            )

            # Loop over the forecast data and save each day's forecast
            for day in forecast_data['data']:
                timestamp = timezone.datetime.fromtimestamp(day['ts'])
                
                # Validate temperature range
                if day['max_temp'] < day['min_temp']:
                    return Response({'error': 'Max temperature cannot be lower than min temperature.'}, status=status.HTTP_400_BAD_REQUEST)

                # Check if forecast exists for this timestamp and location
                if not Forecast.objects.filter(location=location, timestamp=timestamp).exists():
                    forecast_instance = {
                        'location': location.pk,
                        'timestamp': timestamp,
                        'temperature': day['temp'],
                        'max_temperature': day['max_temp'],
                        'min_temperature': day['min_temp'],
                        'humidity': day['rh'],
                        'weather_description': day['weather']['description'],
                    }
                    serializer = ForecastSerializer(data=forecast_instance)
                    if serializer.is_valid():
                        serializer.save()
                    else:
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            saved_forecasts = Forecast.objects.filter(location=location)
            serialized_forecasts = ForecastSerializer(saved_forecasts, many=True)
            return Response(serialized_forecasts.data, status=status.HTTP_201_CREATED)
        
        return Response({'error': 'Failed to fetch forecast data from the API.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
