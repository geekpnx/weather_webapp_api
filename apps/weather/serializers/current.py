from rest_framework import serializers

from apps.weather.models import Current

import requests



class CurrentSerializer(serializers.ModelSerializer):

    def validate_temperature(self, value):
        if value < -100 or value > 100:
            raise serializers.ValidationError("Temperature must be between -100 and 100 degrees.")
        return value
    
    class Meta:
        model = Current
        fields = "__all__"
