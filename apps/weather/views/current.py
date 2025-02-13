import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from apps.weather.models.current import Current
from apps.weather.models.location import Location
from apps.weather.serializers.current import CurrentSerializer


class CurrentWeatherView(APIView):
    def get(self, request, *args, **kwargs):
        city_name = request.query_params.get('city', 'Hamburg')  # Default if no city is provided
        api_key = os.getenv('OPENWEATHERMAP_API_KEY')  # Store API key in settings or environment
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={api_key}&units=metric"

        response = requests.get(url)

        if response.status_code == 200:
            weather_data = response.json()

            # Check if the required keys exist in the response
            if not all(key in weather_data for key in ['name', 'sys', 'coord', 'main', 'wind']):
                return Response({'error': 'Incomplete weather data received from the API.'}, status=status.HTTP_400_BAD_REQUEST)

            # Extract or create the location
            location, created = Location.objects.get_or_create(
                city_name=weather_data['name'],
                country_code=weather_data['sys']['country'],
                latitude=weather_data['coord']['lat'],
                longitude=weather_data['coord']['lon'],
            )

            # Create or update the current weather data
            current_weather = {
                'location': location.id,
                'timestamp': timezone.now(),
                'temperature': weather_data['main']['temp'],
                'humidity': weather_data['main']['humidity'],
                'wind_speed': weather_data['wind']['speed'],
            }

            # Serialize and validate the data
            serializer = CurrentSerializer(data=current_weather)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({'error': 'Failed to fetch weather data from the API.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
