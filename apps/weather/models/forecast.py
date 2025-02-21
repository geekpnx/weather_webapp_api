from django.db import models
from .location import FavoriteLocation

class Forecast(models.Model):
    location = models.ForeignKey(FavoriteLocation, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    temperature = models.FloatField()
    max_temperature = models.FloatField()
    min_temperature = models.FloatField()
    humidity = models.IntegerField()
    weather_description = models.CharField(max_length=100)

    def __str__(self):
        return f"Forecast for {self.location.city_name} at {self.timestamp}"

