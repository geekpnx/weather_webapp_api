from rest_framework import serializers

from apps.weather.models import Current
from apps.weather.serializers.location import LocationSerializer

import requests



class CurrentSerializer(serializers.ModelSerializer):
    location = LocationSerializer()
    def validate_temperature(self, value):
        if value < -100 or value > 100:
            raise serializers.ValidationError("Temperature must be between -100 and 100 degrees.")
        return value
    
    class Meta:
        model = Current
        exclude = ('id',)
