# import base64
# # import math
# import requests
# # from PIL import Image
# from io import BytesIO
# from django.http import JsonResponse
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.authentication import TokenAuthentication
# from rest_framework.permissions import IsAuthenticated
# from apps.user.models import UserProfile
# import os
# import logging
# from django.core.cache import cache
# from concurrent.futures import ThreadPoolExecutor

# import urllib3
# urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
# # import certifi

# logger = logging.getLogger(__name__)

# class RadarView(APIView):
#     """Fetches and stitches OpenStreetMap tiles based on the user's location or provided coordinates (requires authentication)."""
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]

#     def get(self, request, *args, **kwargs):
#         try:
#             user = request.user
#             user_profile = UserProfile.objects.filter(user=user).first()

#             # Get latitude, longitude, zoom level, and layer from query parameters
#             lat = request.query_params.get('lat')
#             lon = request.query_params.get('lon')
#             zoom = int(request.query_params.get('zoom', 20))  # Default zoom level
#             layer = request.query_params.get('layer', 'map')  # Default to 'map' layer

#             if lat and lon:
#                 latitude, longitude = float(lat), float(lon)
#             elif user_profile and user_profile.location:
#                 location = user_profile.location
#                 # Convert city name to latitude and longitude using OpenWeatherMap's geocoding API
#                 api_key = os.getenv('OPENWEATHERMAP_API_KEY')
#                 if not api_key:
#                     return Response({'error': 'OpenWeatherMap API key not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#                 geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={location}&limit=1&appid={api_key}"
#                 geo_response = requests.get(geo_url)

#                 if geo_response.status_code == 200 and geo_response.json():
#                     geo_data = geo_response.json()[0]
#                     latitude, longitude = geo_data["lat"], geo_data["lon"]
#                 else:
#                     return Response({'error': f'Could not determine coordinates for {location}.'}, status=status.HTTP_400_BAD_REQUEST)
#             else:
#                 return Response({'error': 'User location not set and no coordinates provided. Please update your profile or provide coordinates.'}, status=status.HTTP_400_BAD_REQUEST)

#             tiles_x = int(request.query_params.get('tiles_x', 2))  # Default to 2x2 tiles
#             tiles_y = int(request.query_params.get('tiles_y', 2))

#             # Call stitch_tiles with all required arguments
#             combined_image = self.stitch_tiles(layer, zoom, tiles_x, tiles_y, latitude, longitude)

#             if combined_image:
#                 img_io = BytesIO()
#                 combined_image.save(img_io, 'WEBP')  # Save as WebP for smaller size
#                 img_io.seek(0)

#                 # Encode the image data as base64
#                 image_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')

#                 # Return JSON response with image URL, center coordinates, and boundary
#                 return JsonResponse({
#                     'image_url': f"data:image/webp;base64,{image_base64}",
#                     'center': {'lat': latitude, 'lon': longitude},
#                     'boundary': self.get_boundary(latitude, longitude, zoom),  # Add boundary data
#                 })
#             return Response({'error': 'Failed to fetch map data'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         except Exception as e:
#             logger.error(f"Error in RadarView: {str(e)}", exc_info=True)
#             return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
