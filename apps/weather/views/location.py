# from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from apps.weather.models.location import Location
from apps.weather.serializers.location import LocationSerializer

@api_view()
def location_list(request):

    locations = Location.objects.all()
    location_data = LocationSerializer(locations, many=True)

    return Response(location_data.data, status=status.HTTP_200_OK)



