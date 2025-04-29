import base64
import math
import requests
from PIL import Image
from io import BytesIO
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
import os
import logging
import time
from django.core.cache import cache
from concurrent.futures import ThreadPoolExecutor

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
import certifi

logger = logging.getLogger(__name__)

class RadarView(APIView):
    """Fetches and stitches OpenStreetMap tiles based on the user's location or provided coordinates (requires authentication)."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            user = request.user
            user_profile = request.user.userprofile

            # Get latitude, longitude, zoom level, and layer from query parameters
            lat = request.query_params.get('lat')
            lon = request.query_params.get('lon')
            zoom = int(request.query_params.get('zoom', 15))  # Default zoom level
            layer = request.query_params.get('layer', 'map')  # Default to 'map' layer

            if lat and lon:
                latitude, longitude = float(lat), float(lon)
            elif user_profile and user_profile.location:
                location = user_profile.location
                # Convert city name to latitude and longitude using OpenWeatherMap's geocoding API
                api_key = os.getenv('OPENWEATHERMAP_API_KEY')
                if not api_key:
                    return Response({'error': 'OpenWeatherMap API key not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={location}&limit=1&appid={api_key}"
                geo_response = requests.get(geo_url)

                if geo_response.status_code == 200 and geo_response.json():
                    geo_data = geo_response.json()[0]
                    latitude, longitude = geo_data["lat"], geo_data["lon"]
                else:
                    return Response({'error': f'Could not determine coordinates for {location}.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'error': 'User location not set and no coordinates provided. Please update your profile or provide coordinates.'}, status=status.HTTP_400_BAD_REQUEST)

            tiles_x = int(request.query_params.get('tiles_x', 2))  # Default to 2x2 tiles
            tiles_y = int(request.query_params.get('tiles_y', 2))

            # Call stitch_tiles with all required arguments
            combined_image = self.stitch_tiles(layer, zoom, tiles_x, tiles_y, latitude, longitude)

            if combined_image:
                img_io = BytesIO()
                combined_image.save(img_io, 'WEBP')  # Save as WebP for smaller size
                img_io.seek(0)

                # Encode the image data as base64
                image_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')

                # Return JSON response with image URL, center coordinates, and boundary
                return JsonResponse({
                    'image_url': f"data:image/webp;base64,{image_base64}",
                    'center': {'lat': latitude, 'lon': longitude},
                    'boundary': self.get_boundary(latitude, longitude, zoom),  # Add boundary data
                })
            return Response({'error': 'Failed to fetch map data'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.error(f"Error in RadarView: {str(e)}", exc_info=True)
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def stitch_tiles(self, layer, z, tiles_x, tiles_y, lat, lon):
        """Stitches multiple tiles into one image centered around the provided latitude and longitude."""
        try:
            # Calculate the center tile coordinates
            center_x, center_y = self.deg2num(lat, lon, z)
            logger.info(f"Center tile coordinates: x={center_x}, y={center_y}, z={z}")

            # Calculate the starting and ending tile coordinates
            start_x = center_x - tiles_x // 2
            end_x = center_x + tiles_x // 2
            start_y = center_y - tiles_y // 2
            end_y = center_y + tiles_y // 2
            logger.info(f"Tile range: x={start_x}-{end_x}, y={start_y}-{end_y}")

            # Create a blank image to hold the stitched tiles
            base_image = Image.new('RGBA', (256 * tiles_x, 256 * tiles_y))
            overlay_image = Image.new('RGBA', (256 * tiles_x, 256 * tiles_y))

            # Fetch and stitch base map tiles (OpenStreetMap)
            with ThreadPoolExecutor() as executor:
                futures = []
                for x in range(start_x, end_x + 1):
                    for y in range(start_y, end_y + 1):
                        if y < 0 or y >= 2 ** z:
                            continue
                        base_url = f'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                        futures.append(executor.submit(self.get_tile_from_cache_or_fetch, base_url))

                for idx, future in enumerate(futures):
                    base_tile = future.result()
                    if base_tile:
                        x = start_x + (idx // tiles_y)
                        y = start_y + (idx % tiles_y)
                        paste_x = (x - start_x) * 256
                        paste_y = (y - start_y) * 256
                        base_image.paste(base_tile, (paste_x, paste_y))

            # Combine the base map and weather layer
            combined_image = Image.alpha_composite(base_image, overlay_image)
            return combined_image
        except Exception as e:
            logger.error(f"Error in stitching tiles: {str(e)}", exc_info=True)
            return None

    def get_tile_from_cache_or_fetch(self, url):
        """Fetch a tile from cache or make a network request."""
        cache_key = f"tile_{url}"
        cached_tile = cache.get(cache_key)
        if cached_tile:
            return Image.open(BytesIO(cached_tile)).convert('RGBA')

        headers = {'User-Agent': 'YourAppName/1.0 (your@email.com)'}
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            cache.set(cache_key, response.content, timeout=3600)  # Cache for 1 hour
            return Image.open(BytesIO(response.content)).convert('RGBA')
        return None

    def deg2num(self, lat_deg, lon_deg, zoom):
        """Convert latitude and longitude to tile coordinates."""
        lat_rad = math.radians(lat_deg)
        n = 2.0 ** zoom
        xtile = int((lon_deg + 180.0) / 360.0 * n)
        ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
        return xtile, ytile

    def get_boundary(self, lat, lon, zoom):
        """Calculate boundary coordinates (e.g., a circle or polygon) around the location."""
        radius = 5000  # Radius in meters
        earth_radius = 6378137  # Earth's radius in meters
        lat_rad = math.radians(lat)
        lon_rad = math.radians(lon)
        boundary = []
        for angle in range(0, 360, 10):  # Create a circle with 36 points
            angle_rad = math.radians(angle)
            boundary_lat = lat + (radius / earth_radius) * (180 / math.pi) * math.sin(angle_rad)
            boundary_lon = lon + (radius / earth_radius) * (180 / math.pi) * math.cos(angle_rad) / math.cos(lat_rad)
            boundary.append([boundary_lat, boundary_lon])
        return boundary