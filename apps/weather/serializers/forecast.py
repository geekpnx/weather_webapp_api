from rest_framework import serializers

from apps.weather.models import Forecast, Location

class ForecastSerializer(serializers.ModelSerializer):

    def validate(self, data):
        if data['max_temperature'] < data['min_temperature']:
            raise serializers.ValidationError("Max temperature cannot be lower than min temperature.")
        return data

    class Meta:
        model = Forecast
        exclude = ('id',)
