import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from apps.weather.serializers.alerts import AlertSerializer


class AlertsView(APIView):
    def get(self, request, *args, **kwargs):
        city = request.query_params.get('city', 'New York')  # Default if no city is provided
        api_key = os.getenv('WEATHER_API_KEY')  # Use environment variable for the API key
        url = 'http://api.weatherapi.com/v1/forecast.json'
        params = {
            'key': api_key,
            'q': city,  # Dynamic city
            'alerts': 'yes'
        }

        response = requests.get(url, params=params)
        if response.status_code == 200:
            alerts_data = response.json().get('alerts', {}).get('alert', [])
            if not alerts_data:
                return Response({'error': 'No alerts found for the given city.'}, status=status.HTTP_404_NOT_FOUND)

            # Prepare data to match the serializer
            serialized_data = [
                {
                    "headline": alert.get("headline"),
                    "desc": alert.get("desc"),
                    "effective": alert.get("effective"),
                    "expires": alert.get("expires")
                }
                for alert in alerts_data
            ]

            serializer = AlertSerializer(data=serialized_data, many=True)
            if serializer.is_valid():
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'error': 'Failed to fetch alerts'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
