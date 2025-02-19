from django.db import models
from django.contrib.auth.models import User

class Location(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    city_name = models.CharField(max_length=100)
    country_code = models.CharField(max_length=3)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ('city_name', 'country_code', 'user')  # Ensure unique per user

    def __str__(self):
        return f"{self.city_name}, {self.country_code}"
