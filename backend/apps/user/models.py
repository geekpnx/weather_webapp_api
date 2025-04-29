from django.db import models
from django.contrib.auth.models import User
from apps.core.constants import PREFERRED_UNITS, THEME_CHOICES  # Add THEME_CHOICES to constants

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(
        upload_to='profile_pics',
        null=True,
        blank=True# Relative path to media directory
    )
    location = models.CharField(max_length=100)
    preferred_temperature_unit = models.CharField(max_length=1, choices=PREFERRED_UNITS, default='C')
    favorite_locations = models.JSONField(default=list)
    preferred_theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')

    def __str__(self):
        return f"{self.user.username}'s profile"