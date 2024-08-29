from django.utils import timezone
from apps.weather.models import Forecast, Location
from apps.weather.serializers.forecast import ForecastSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
class ForecastListView(APIView):
    def get(self, request):
        city_name = request.query_params.get('city', 'London')
        api_key = 'aa0c4c36946b490e8d6eaced1c10ed49'
        url = f'https://api.weatherbit.io/v2.0/forecast/daily?city={city_name}&key={api_key}'
        response = requests.get(url)
        if response.status_code == 200:
            forecast_data = response.json()
            location, _ = Location.objects.get_or_create(
                city_name=forecast_data['city_name'],
                country_code=forecast_data['country_code'],
                latitude=forecast_data['lat'],
                longitude=forecast_data['lon'],
            )
            for day in forecast_data['data']:
                timestamp = timezone.datetime.fromtimestamp(day['ts'])
                # Check if a forecast for this timestamp and location already exists
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
