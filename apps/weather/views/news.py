from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from apps.weather.serializers.news import NewsSerializer

class NewsView(APIView):
    def get(self, request, *args, **kwargs):
        response = requests.get('https://newsapi.org/v2/everything?q=bitcoin&apiKey=3d6ea3efc349442e9712947edb8ddc1d')
        if response.status_code == 200:
            news_data = response.json()
            serializer = NewsSerializer(data=news_data, many=True)
            if serializer.is_valid():
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Failed to fetch news'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
