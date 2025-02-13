from django.db import models

class Location(models.Model):
    city_name = models.CharField(max_length=100)
    country_code = models.CharField(max_length=3, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.city_name}, {self.country_code}"
