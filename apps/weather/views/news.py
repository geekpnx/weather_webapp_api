from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from apps.weather.serializers.news import NewsSerializer

class NewsView(APIView):
    def get(self, request, *args, **kwargs):
        # Update the query to focus on weather-related news
        url = 'https://newsapi.org/v2/everything'
        params = {
            'q': 'weather',  # Search for articles containing 'weather'
            'apiKey': '3d6ea3efc349442e9712947edb8ddc1d',
            'language': 'en',  # Optional: filter by language if desired
            'sortBy': 'publishedAt',  # Optional: sort results by relevancy
        }

        response = requests.get(url, params=params)
        if response.status_code == 200:
            news_data = response.json().get('articles', [])
            serialized_data = [
                {
                    "title": article["title"],
                    "url": article["url"],
                    "publishedAt": article["publishedAt"],
                    "content": article["content"]  # Or use "content" for more detail
                }
                for article in news_data
            ]
            serializer = NewsSerializer(data=serialized_data, many=True)
            if serializer.is_valid():
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'Failed to fetch news'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)