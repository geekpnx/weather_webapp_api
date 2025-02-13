import os
import requests
from PIL import Image
from io import BytesIO
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class RadarView(APIView):
    def get(self, request, *args, **kwargs):
        layer = request.query_params.get('layer', 'temp')
        z = int(request.query_params.get('z', 4))
        tiles_x = int(request.query_params.get('tiles_x', 16))
        tiles_y = int(request.query_params.get('tiles_y', 10))

        api_key = os.getenv('OPENWEATHERMAP_API_KEY')
        combined_image = self.stitch_tiles(layer, z, tiles_x, tiles_y, api_key)

        if combined_image:
            img_io = BytesIO()
            combined_image.save(img_io, 'PNG')
            img_io.seek(0)
            return HttpResponse(img_io.getvalue(), content_type='image/png')

        return Response({'error': 'Failed to fetch radar data'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def stitch_tiles(self, layer, z, tiles_x, tiles_y, api_key):
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
