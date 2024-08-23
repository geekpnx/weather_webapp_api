# from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from apps.weather.models.forecast import Forecast
from apps.weather.serializers.forecast import ForecastSerializer

@api_view()
def forecast_list(request):

    forecasts = Forecast.objects.all()
    forecast_data = ForecastSerializer(forecasts, many=True)

    return Response(forecast_data.data, status=status.HTTP_200_OK)
