from django.utils import timezone
from apps.weather.models import Forecast, Location
from apps.weather.serializers.forecast import ForecastSerializer
from apps.user.models import UserProfile  # Import UserProfile
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
import os


class ForecastListView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            try:
                user_profile = UserProfile.objects.get(user=request.user)
                city_name = user_profile.location if user_profile.location else 'London'
            except UserProfile.DoesNotExist:
                city_name = 'London'
        else:
            city_name = request.query_params.get('city', 'London')

        # Get location details from the database or create a new entry
        location, _ = Location.objects.get_or_create(city_name=city_name)

        api_key = os.getenv('OPENWEATHERMAP_API_KEY')  # Use OpenWeather API key
        geocode_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city_name}&appid={api_key}"
        geocode_response = requests.get(geocode_url)

        if geocode_response.status_code == 200 and geocode_response.json():
            geocode_data = geocode_response.json()[0]
            latitude = geocode_data['lat']
            longitude = geocode_data['lon']
        else:
            return Response({'error': 'Failed to retrieve location coordinates.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Fetch weather forecast data
        forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?lat={latitude}&lon={longitude}&appid={api_key}&units=metric"
        response = requests.get(forecast_url)

        if response.status_code == 200:
            forecast_data = response.json()

            for entry in forecast_data['list']:
                timestamp = timezone.datetime.fromtimestamp(entry['dt'])

                # Validate temperature range
                temp = entry['main']['temp']
                max_temp = entry['main']['temp_max']
                min_temp = entry['main']['temp_min']
                humidity = entry['main']['humidity']
                weather_description = entry['weather'][0]['description']

                if max_temp < min_temp:
                    return Response({'error': 'Max temperature cannot be lower than min temperature.'}, status=status.HTTP_400_BAD_REQUEST)

                # Check if forecast exists for this timestamp and location
                if not Forecast.objects.filter(location=location, timestamp=timestamp).exists():
                    forecast_instance = {
                        'location': location.pk,
                        'timestamp': timestamp,
                        'temperature': temp,
                        'max_temperature': max_temp,
                        'min_temperature': min_temp,
                        'humidity': humidity,
                        'weather_description': weather_description,
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
