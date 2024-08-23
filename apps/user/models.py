from django.db import models
from django.contrib.auth.models import User
from apps.core.constants import PREFERRED_UNITS



class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=100)
    preferred_temperature_unit = models.CharField(max_length=1, choices=PREFERRED_UNITS)