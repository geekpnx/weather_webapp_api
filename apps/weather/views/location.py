from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from apps.weather.models.location import FavoriteLocation
from apps.weather.serializers.location import FavoriteLocationSerializer

class FavoriteLocationView(APIView):
    """Handles a user's favorite locations."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get all favorite locations of the authenticated user."""
        favorites = FavoriteLocation.objects.filter(user=request.user)
        serializer = FavoriteLocationSerializer(favorites, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Add a new favorite location."""
        serializer = FavoriteLocationSerializer(data=request.data)
        if serializer.is_valid():
            # Save the location with the authenticated user
            FavoriteLocation.objects.get_or_create(user=request.user, **serializer.validated_data)
            return Response({'message': 'Location added to favorites.'}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """Remove a favorite location."""
        city_name = request.data.get('city_name')
        country_code = request.data.get('country_code')

        if not city_name or not country_code:
            return Response({'error': 'City name and country code are required.'}, status=status.HTTP_400_BAD_REQUEST)

        favorite = FavoriteLocation.objects.filter(user=request.user, city_name=city_name, country_code=country_code).first()
        if favorite:
            favorite.delete()
            return Response({'message': f'{city_name} removed from favorites.'}, status=status.HTTP_200_OK)

        return Response({'error': f'{city_name} not found in favorites.'}, status=status.HTTP_404_NOT_FOUND)
