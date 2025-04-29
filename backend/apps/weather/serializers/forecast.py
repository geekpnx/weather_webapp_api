from rest_framework import serializers

from apps.weather.models import Forecast

class ForecastSerializer(serializers.ModelSerializer):

    def validate(self, data):
        if data['max_temperature'] < data['min_temperature']:
            raise serializers.ValidationError("Max temperature cannot be lower than min temperature.")
        return data

    def validate_humidity(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Humidity must be between 0 and 100.")
        return value

    class Meta:
        model = Forecast
        fields = ['location', 'timestamp', 'temperature', 'max_temperature', 'min_temperature', 'humidity', 'weather_description']

