from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from apps.weather.serializers.radar import RadarSerializer

class RadarView(APIView):
    def get(self, request, *args, **kwargs):
        response = requests.get('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=91e6f5764bd99bc30afcbc68dba30d3a')
        if response.status_code == 200:
            radar_data = response.json()
            serializer = RadarSerializer(data=radar_data, many=True)
            if serializer.is_valid():
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Failed to fetch radar data'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
