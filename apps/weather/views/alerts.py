from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from apps.weather.serializers.alerts import AlertSerializer

class AlertsView(APIView):
    def get(self, request, *args, **kwargs):
        response = requests.get('https://api.openweathermap.org/data/2.5/roadrisk?appid=91e6f5764bd99bc30afcbc68dba30d3a')
        if response.status_code == 200:
            alerts_data = response.json()
            serializer = AlertSerializer(data=alerts_data, many=True)
            if serializer.is_valid():
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Failed to fetch alerts'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
