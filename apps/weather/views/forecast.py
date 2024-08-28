# from django.db import transaction
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import status

# from apps.weather.models.forecast import Forecast
# from apps.weather.serializers.forecast import ForecastSerializer

# @api_view()
# def forecast_list(request):

#     forecasts = Forecast.objects.all()
#     forecast_data = ForecastSerializer(forecasts, many=True)

#     return Response(forecast_data.data, status=status.HTTP_200_OK)

# import requests
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from django.utils import timezone

# from apps.weather.models import Forecast, Location
# from apps.weather.serializers.forecast import ForecastSerializer

# class ForecastListView(APIView):
#     def get(self, request):
#         city_name = request.query_params.get('city', 'London')  # Default city
#         api_key = 'aa0c4c36946b490e8d6eaced1c10ed49'
#         url = f'https://api.weatherbit.io/v2.0/forecast/daily?city={city_name}&key={api_key}'

#         response = requests.get(url)

#         if response.status_code == 200:
#             forecast_data = response.json()
#             forecasts = []

#             # Process each day's forecast
#             for day in forecast_data['data']:
#                 location, _ = Location.objects.get_or_create(
#                     city_name=forecast_data['city_name'],
#                     country_code=forecast_data['country_code'],
#                     latitude=forecast_data['lat'],
#                     longitude=forecast_data['lon'],
#                 )

#                 forecast_instance = {
#                     'location': location.id,
#                     'timestamp': timezone.datetime.fromtimestamp(day['ts']),  # Convert timestamp
#                     'temperature': day['temp'],
#                     'max_temperature': day['max_temp'],
#                     'min_temperature': day['min_temp'],
#                     'humidity': day['rh'],
#                     'weather_description': day['weather']['description'],
#                 }
#                 forecasts.append(forecast_instance)

#             # Save all forecasts to the database
#             for forecast_instance in forecasts:
#                 serializer = ForecastSerializer(data=forecast_instance)
#                 if serializer.is_valid():
#                     serializer.save()
#                     return Response(serializer.data, status=status.HTTP_200_OK)
#                 else:
#                     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#             saved_forecasts = ForecastSerializer(forecasts, many=True)  # Serialize all saved forecasts
#             return Response(saved_forecasts.data, status=status.HTTP_201_CREATED)

#         return Response({'error': 'Failed to fetch forecast data from the API.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from apps.weather.models import Forecast, Location
from apps.weather.serializers.forecast import ForecastSerializer

class ForecastListView(APIView):
    def get(self, request):
        # Get the city name from the query parameters
        city_name = request.query_params.get('city', 'London')
        api_key = 'aa0c4c36946b490e8d6eaced1c10ed49'
        url = f'https://api.weatherbit.io/v2.0/forecast/daily?city={city_name}&key={api_key}'

        response = requests.get(url)

        if response.status_code == 200:
            forecast_data = response.json()
            forecasts = []

            # Ensure we create the location or get it if it already exists
            location, _ = Location.objects.get_or_create(
                city_name=forecast_data['city_name'],
                country_code=forecast_data['country_code'],
                latitude=forecast_data['lat'],
                longitude=forecast_data['lon'],
            )

            # Process each day's forecast
            for day in forecast_data['data']:
                # Prepare a forecast instance for each day
                forecast_instance = {
                    'location': location.pk,  # Pass the Location object itself
                    'timestamp': timezone.datetime.fromtimestamp(day['ts']),  # Convert timestamp
                    'temperature': day['temp'],
                    'max_temperature': day['max_temp'],
                    'min_temperature': day['min_temp'],
                    'humidity': day['rh'],
                    'weather_description': day['weather']['description'],
                }
                forecasts.append(forecast_instance)

            # Save all forecasts to the database
            for forecast_instance in forecasts:
                serializer = ForecastSerializer(data=forecast_instance)
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Return all saved forecasts
            saved_forecasts = Forecast.objects.filter(location=location)  # Get all forecasts for this location
            serialized_forecasts = ForecastSerializer(saved_forecasts, many=True)  # Serialize them
            return Response(serialized_forecasts.data, status=status.HTTP_201_CREATED)

        return Response({'error': 'Failed to fetch forecast data from the API.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)