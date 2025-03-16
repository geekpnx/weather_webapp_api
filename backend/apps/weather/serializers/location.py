from rest_framework import serializers
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.weather.models.location import FavoriteLocation

class FavoriteLocationSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(
        required=False,  # Not required, will accept null or omitted
        allow_null=True,  # Allow null values
        validators=[MinValueValidator(-90), MaxValueValidator(90)]
    )
    longitude = serializers.FloatField(
        required=False,  # Not required, will accept null or omitted
        allow_null=True,  # Allow null values
        validators=[MinValueValidator(-180), MaxValueValidator(180)]
    )

    class Meta:
        model = FavoriteLocation
        fields = ['id', 'city_name', 'country_code', 'latitude', 'longitude']
