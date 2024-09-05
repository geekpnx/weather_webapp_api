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
        # Get parameters from request
        layer = request.query_params.get('layer', 'temp')  # default to 'temp'
        z = int(request.query_params.get('z', 4))  # default to zoom level 5
        tiles_x = int(request.query_params.get('tiles_x', 16))  # default to 4 tiles horizontally
        tiles_y = int(request.query_params.get('tiles_y', 10))  # default to 8 tiles vertically

        # Load API key from environment variables or settings
        api_key = os.getenv('OPENWEATHERMAP_API_KEY', '91e6f5764bd99bc30afcbc68dba30d3a')

        # Call the method to stitch tiles
        combined_image = self.stitch_tiles(layer, z, tiles_x, tiles_y, api_key)

        if combined_image:
            # Save the image to a BytesIO object
            img_io = BytesIO()
            combined_image.save(img_io, 'PNG')
            img_io.seek(0)

            # Return the image as an HTTP response
            return HttpResponse(img_io.getvalue(), content_type='image/png')
        else:
            return Response({'error': 'Failed to fetch radar data'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def stitch_tiles(self, layer, z, tiles_x, tiles_y, api_key):
        try:
            # Initialize a blank image for the final combined image
            combined_image = Image.new('RGB', (256 * tiles_x, 256 * tiles_y))

            # Iterate over the grid of tiles
            for x in range(tiles_x):
                for y in range(tiles_y):
                    # Construct the URL for each tile
                    url = f'https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}'
                    response = requests.get(url)
                    
                    if response.status_code == 200:
                        tile_image = Image.open(BytesIO(response.content))
                        # Paste the tile into the combined image
                        combined_image.paste(tile_image, (x * 256, y * 256))
                    else:
                        return None  # Return None if any tile fails to load

            return combined_image
        except Exception as e:
            print(f"Error in stitching tiles: {e}")
            return None
