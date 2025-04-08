
from rest_framework import serializers
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.weather.models.location import FavoriteLocation

class FavoriteLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteLocation
        fields = ['id', 'city_name', 'country_code', 'latitude', 'longitude']
        extra_kwargs = {
            'country_code': {'required': False, 'allow_blank': True},
            'latitude': {'required': True},
            'longitude': {'required': True},
        }

    def validate(self, data):
        """Ensure required fields are present"""
        if not data.get('city_name'):
            raise serializers.ValidationError("city_name is required")
        if data.get('latitude') is None:
            raise serializers.ValidationError("latitude is required")
        if data.get('longitude') is None:
            raise serializers.ValidationError("longitude is required")
        return data
