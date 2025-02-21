import os
import requests
from PIL import Image
from io import BytesIO
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from apps.user.models import UserProfile  # Import UserProfile

class RadarView(APIView):
    """Fetches and stitches radar images based on the user's location (requires authentication)."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        user_profile = UserProfile.objects.filter(user=user).first()

        if user_profile and user_profile.location:
            location = user_profile.location
        else:
            return Response({'error': 'User location not set. Please update your profile.'}, status=status.HTTP_400_BAD_REQUEST)

        # Convert city name to latitude and longitude using OpenWeatherMap's geocoding API
        api_key = os.getenv('OPENWEATHERMAP_API_KEY')
        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={location}&limit=1&appid={api_key}"
        geo_response = requests.get(geo_url)

        if geo_response.status_code == 200 and geo_response.json():
            geo_data = geo_response.json()[0]
            latitude, longitude = geo_data["lat"], geo_data["lon"]
        else:
            return Response({'error': f'Could not determine coordinates for {location}.'}, status=status.HTTP_400_BAD_REQUEST)

        layer = request.query_params.get('layer', 'temp')
        z = int(request.query_params.get('z', 4))
        tiles_x = int(request.query_params.get('tiles_x', 16))
        tiles_y = int(request.query_params.get('tiles_y', 10))

        combined_image = self.stitch_tiles(layer, z, tiles_x, tiles_y, api_key)

        if combined_image:
            img_io = BytesIO()
            combined_image.save(img_io, 'PNG')
            img_io.seek(0)
            return HttpResponse(img_io.getvalue(), content_type='image/png')

        return Response({'error': 'Failed to fetch radar data'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def stitch_tiles(self, layer, z, tiles_x, tiles_y, api_key):
        """Stitches multiple radar tiles into one image."""
        try:
            combined_image = Image.new('RGB', (256 * tiles_x, 256 * tiles_y))
            for x in range(tiles_x):
                for y in range(tiles_y):
                    url = f'https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}'
                    response = requests.get(url)
                    if response.status_code == 200:
                        tile_image = Image.open(BytesIO(response.content))
                        combined_image.paste(tile_image, (x * 256, y * 256))
                    else:
                        return None  # Return None if any tile fails to load
            return combined_image
        except Exception as e:
            print(f"Error in stitching tiles: {e}")
            return None
