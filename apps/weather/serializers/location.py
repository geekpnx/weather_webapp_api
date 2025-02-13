from rest_framework import serializers
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.weather.models import Location


class LocationSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(
        validators=[MinValueValidator(-90), MaxValueValidator(90)]
    )
    longitude = serializers.FloatField(
        validators=[MinValueValidator(-180), MaxValueValidator(180)]
    )

    class Meta:
        model = Location
        fields = ['city_name', 'country_code', 'latitude', 'longitude']
