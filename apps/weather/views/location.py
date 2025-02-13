from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from apps.weather.models.location import Location
from apps.weather.serializers.location import LocationSerializer

@api_view()
def location_list(request):
    locations = Location.objects.all()
    paginator = PageNumberPagination()
    paginator.page_size = 10  # Set the page size as needed
    paginated_locations = paginator.paginate_queryset(locations, request)
    location_data = LocationSerializer(paginated_locations, many=True)
    return paginator.get_paginated_response(location_data.data)
