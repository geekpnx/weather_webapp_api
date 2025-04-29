
from django.db import IntegrityError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from apps.weather.models.location import FavoriteLocation
from apps.weather.serializers.location import FavoriteLocationSerializer

import logging
logger = logging.getLogger(__name__)

class FavoriteLocationView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    
    def get(self, request):
        """Get all favorite locations for the user"""
        favorites = FavoriteLocation.objects.filter(user=request.user)
        serializer = FavoriteLocationSerializer(favorites, many=True)
        return Response({
            'favorites': serializer.data
        })


    def post(self, request):
        # Ensure required fields are present
        required_fields = ['city_name', 'latitude', 'longitude']
        if not all(field in request.data for field in required_fields):
            return Response(
                {'error': 'Missing required fields: city_name, latitude, longitude'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            city_name = request.data['city_name']
            
            # Case-insensitive duplicate check
            exists = FavoriteLocation.objects.filter(
                user=request.user,
                city_name__iexact=city_name  # Case-insensitive match
            ).exists()
            
            if exists:
                return Response(
                    {'message': 'Location already in favorites'},
                    status=status.HTTP_200_OK
                )
            
            # Create the favorite location
            favorite = FavoriteLocation.objects.create(
                user=request.user,
                city_name=city_name,
                country_code=request.data.get('country_code', ''),
                latitude=request.data['latitude'],
                longitude=request.data['longitude']
            )
            
            serializer = FavoriteLocationSerializer(favorite)
            return Response(
                {'message': 'Location added to favorites', 'data': serializer.data},
                status=status.HTTP_201_CREATED
            )
            
        except IntegrityError as e:
            return Response(
                {'error': 'Database error: ' + str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    def delete(self, request):
        """Remove a favorite location."""
        city_name = request.data.get('city_name')
        if not city_name:
            return Response(
                {'error': 'city_name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            favorite = FavoriteLocation.objects.get(
                user=request.user,
                city_name=city_name
            )
            favorite.delete()
            return Response(
                {'message': f'{city_name} removed from favorites'},
                status=status.HTTP_200_OK
            )
        except FavoriteLocation.DoesNotExist:
            return Response(
                {'error': 'Favorite location not found'},
                status=status.HTTP_404_NOT_FOUND
            )