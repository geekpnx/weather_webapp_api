from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from apps.weather.serializers.alerts import AlertSerializer

class AlertsView(APIView):
    def get(self, request, *args, **kwargs):
        url = 'http://api.weatherapi.com/v1/forecast.json'
        params = {
            'key': '674a65e560f14edfa43170838242708',
            'q': 'New York',  # You can change this to make it dynamic based on user input
            'alerts': 'yes'
        }

        response = requests.get(url, params=params)
        if response.status_code == 200:
            alerts_data = response.json().get('alerts', {}).get('alert', [])
            
            # Prepare data to match the serializer
            serialized_data = [
                {
                    "headline": alert.get("headline"),
                    "desc": alert.get("desc"),
                    # "category": alert.get("category"),
                    "effective": alert.get("effective"),
                    "expires": alert.get("expires")
                }
                for alert in alerts_data
            ]

            serializer = AlertSerializer(data=serialized_data, many=True)
            if serializer.is_valid():
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Failed to fetch alerts'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)