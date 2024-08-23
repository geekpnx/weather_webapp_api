# from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from apps.weather.models.current import Current
from apps.weather.serializers.current import CurrentSerializer

@api_view()
def current_list(request):

    currents = Current.objects.all()
    current_data = CurrentSerializer(currents, many=True)

    return Response(current_data.data, status=status.HTTP_200_OK)
