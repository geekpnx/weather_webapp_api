import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
import requests
from apps.weather.serializers.news import NewsSerializer

class NewsView(APIView):
    """Fetches weather-related news based on the user's location (requires authentication)."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        user_profile = request.user.userprofile

        # Get location from query parameters or user profile
        location = request.query_params.get('location', None)
        if not location and user_profile and user_profile.location:
            location = user_profile.location

        if not location:
            return Response({'error': 'Location not provided and user location not set. Please update your profile or provide a location.'}, status=status.HTTP_400_BAD_REQUEST)

        url = 'https://newsapi.org/v2/everything'
        params = {
            'q': f'weather {location}',  # Fetch weather news relevant to the user's location
            'apiKey': os.getenv('NEWS_API_KEY'),
            'language': 'en',
            'sortBy': 'publishedAt',
        }

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()  # Raise an error for bad status codes
            news_data = response.json().get('articles', [])
            if not news_data:
                return Response({'error': f'No news articles found for {location}.'}, status=status.HTTP_404_NOT_FOUND)

            # Filter for weather-related news and include urlToImage
            serialized_data = [
                {
                    "title": article["title"],
                    "url": article["url"],
                    "publishedAt": article["publishedAt"],
                    "content": article["content"],
                    "urlToImage": article.get("urlToImage")  # Include urlToImage
                }
                for article in news_data
                if "weather" in article.get("title", "").lower() or "weather" in article.get("description", "").lower()  # Filter for weather-related news
            ]

            if not serialized_data:
                return Response([], status=status.HTTP_200_OK)

            serializer = NewsSerializer(data=serialized_data, many=True)
            if serializer.is_valid():
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except requests.exceptions.HTTPError as http_err:
            if response.status_code == 429:  # Too Many Requests
                return Response({'error': 'News API request limit reached. Please try again later.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
            return Response({'error': 'Failed to fetch news'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as err:
            return Response({'error': 'Failed to fetch news'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)