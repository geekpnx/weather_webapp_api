from rest_framework import serializers

from apps.weather.models import Forecast

class NewsSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    link = serializers.URLField()
    published = serializers.DateTimeField()
    summary = serializers.CharField(max_length=500)



    def validate(self, data):
        if data['max_temperature'] < data['min_temperature']:
            raise serializers.ValidationError("Max temperature cannot be lower than min temperature.")
        return data

