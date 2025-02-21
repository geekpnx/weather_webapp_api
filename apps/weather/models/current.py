from django.db import models
from .location import FavoriteLocation

class Current(models.Model):
    location = models.ForeignKey(FavoriteLocation, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    temperature = models.FloatField()
    humidity = models.IntegerField()
    wind_speed = models.FloatField()