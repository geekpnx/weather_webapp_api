from django.db import models
from .location import Location

class Forecast(models.Model):
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    temperature = models.FloatField()
    max_temperature = models.FloatField()
    min_temperature = models.FloatField()
    humidity = models.IntegerField()
    weather_description = models.CharField(max_length=100)
