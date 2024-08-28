from rest_framework import serializers

from apps.weather.models import Location

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        exclude = ('id',)
