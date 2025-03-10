import time
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

import logging

logger = logging.getLogger(__name__)

class RadarView(APIView):
    """Fetches and stitches OpenStreetMap tiles based on the user's location or provided coordinates (requires authentication)."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            user = request.user
            user_profile = UserProfile.objects.filter(user=user).first()

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
                api_key = os.getenv('OPENWEATHERMAP_API_KEY')  # Still using OpenWeatherMap for geocoding
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

            tiles_x = int(request.query_params.get('tiles_x', 4))  # Adjust based on zoom level
            tiles_y = int(request.query_params.get('tiles_y', 4))  # Adjust based on zoom level

            # Call stitch_tiles with all required arguments
            combined_image = self.stitch_tiles(layer, zoom, tiles_x, tiles_y, latitude, longitude)

            if combined_image:
                img_io = BytesIO()
                combined_image.save(img_io, 'PNG')
                img_io.seek(0)
                return HttpResponse(img_io.getvalue(), content_type='image/png')

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
            for x in range(start_x, end_x + 1):
                for y in range(start_y, end_y + 1):
                    # Ensure y is within valid range
                    if y < 0 or y >= 2 ** z:
                        logger.warning(f"Skipping invalid tile: y={y} (zoom={z})")
                        continue

                    # Fetch base map tile (OpenStreetMap)
                    base_url = f'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                    logger.info(f"Fetching base map tile: {base_url}")

                    headers = {
                        'User-Agent': 'YourAppName/1.0 (your@email.com)'
                    }
                    base_response = requests.get(base_url, headers=headers)

                    if base_response.status_code == 200:
                        base_tile = Image.open(BytesIO(base_response.content)).convert('RGBA')
                        # Calculate the position to paste the tile
                        paste_x = (x - start_x) * 256
                        paste_y = (y - start_y) * 256
                        base_image.paste(base_tile, (paste_x, paste_y))
                    else:
                        logger.error(f"Failed to fetch base map tile: {base_url}, status code: {base_response.status_code}")
                        return Response(
                            {'error': f'Failed to fetch base map tile: {base_url}, status code: {base_response.status_code}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )

                    # Add a delay to avoid rate limiting
                    time.sleep(0.1)  # 100ms delay between requests

            # Fetch and stitch weather layer tiles (OpenWeatherMap)
            if layer != 'map':
                for x in range(start_x, end_x + 1):
                    for y in range(start_y, end_y + 1):
                        # Ensure y is within valid range
                        if y < 0 or y >= 2 ** z:
                            logger.warning(f"Skipping invalid tile: y={y} (zoom={z})")
                            continue

                        # Fetch weather layer tile (OpenWeatherMap)
                        api_key = os.getenv('OPENWEATHERMAP_API_KEY')
                        if not api_key:
                            logger.error("OpenWeatherMap API key not configured.")
                            return Response(
                                {'error': 'OpenWeatherMap API key not configured.'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR
                            )
                        overlay_url = f'https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}'
                        logger.info(f"Fetching weather layer tile: {overlay_url}")

                        overlay_response = requests.get(overlay_url, headers=headers)

                        if overlay_response.status_code == 200:
                            overlay_tile = Image.open(BytesIO(overlay_response.content)).convert('RGBA')
                            # Reduce transparency of the overlay tile
                            overlay_tile = overlay_tile.point(lambda p: p * 0.8)  # Adjust transparency (0.7 = 70% opacity)
                            # Calculate the position to paste the tile
                            paste_x = (x - start_x) * 256
                            paste_y = (y - start_y) * 256
                            overlay_image.paste(overlay_tile, (paste_x, paste_y), overlay_tile)
                        else:
                            logger.error(f"Failed to fetch weather layer tile: {overlay_url}, status code: {overlay_response.status_code}")
                            return Response(
                                {'error': f'Failed to fetch weather layer tile: {overlay_url}, status code: {overlay_response.status_code}'},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR
                            )

                        # Add a delay to avoid rate limiting
                        time.sleep(0.1)  # 100ms delay between requests

            # Combine the base map and weather layer
            combined_image = Image.alpha_composite(base_image, overlay_image)

            return combined_image
        except Exception as e:
            logger.error(f"Error in stitching tiles: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Internal server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def deg2num(self, lat_deg, lon_deg, zoom):
        """Convert latitude and longitude to tile coordinates."""
        import math
        lat_rad = math.radians(lat_deg)
        n = 2.0 ** zoom
        xtile = int((lon_deg + 180.0) / 360.0 * n)
        ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
        return xtile, ytile