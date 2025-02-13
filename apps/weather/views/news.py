import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from apps.weather.serializers.news import NewsSerializer


class NewsView(APIView):
    def get(self, request, *args, **kwargs):
        url = 'https://newsapi.org/v2/everything'
        params = {
            'q': 'weather',
            'apiKey': os.getenv('NEWS_API_KEY'),  # Use environment variable for API key
            'language': 'en',
            'sortBy': 'publishedAt',
        }

        response = requests.get(url, params=params)
        if response.status_code == 200:
            news_data = response.json().get('articles', [])
            if not news_data:
                return Response({'error': 'No news articles found.'}, status=status.HTTP_404_NOT_FOUND)

            serialized_data = [
                {
                    "title": article["title"],
                    "url": article["url"],
                    "publishedAt": article["publishedAt"],
                    "content": article["content"]
                }
                for article in news_data
            ]
            serializer = NewsSerializer(data=serialized_data, many=True)
            if serializer.is_valid():
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({'error': 'Failed to fetch news'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
