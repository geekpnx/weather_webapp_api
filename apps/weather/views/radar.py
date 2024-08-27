# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# import requests
# from apps.weather.serializers.radar import RadarSerializer

# class RadarView(APIView):
#     def get(self, request, *args, **kwargs):
#         response = requests.get('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid=91e6f5764bd99bc30afcbc68dba30d3a')
#         if response.status_code == 200:
#             radar_data = response.json()
#             serializer = RadarSerializer(data=radar_data, many=True)
#             if serializer.is_valid():
#                 return Response(serializer.data, status=status.HTTP_200_OK)
#             else:
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         return Response({'error': 'Failed to fetch radar data'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
import os

class RadarView(APIView):
    def get(self, request, *args, **kwargs):
        # Get parameters from request
        layer = request.query_params.get('layer', 'temp')  # default to 'precipitation_new'
        z = kwargs.get('z', '5')
        x = kwargs.get('x', '6')
        y = kwargs.get('y', '7')

        # Load API key from environment variables or settings
        api_key = os.getenv('OPENWEATHERMAP_API_KEY', '91e6f5764bd99bc30afcbc68dba30d3a')

        # Build the URL
        url = f'https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}'

        # Fetch the radar tile image
        response = requests.get(url)
        if response.status_code == 200:
            # Return the image as an HTTP response
            return HttpResponse(response.content, content_type='image/png')
        else:
            return Response({'error': 'Failed to fetch radar data'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
