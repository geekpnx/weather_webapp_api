from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields= ['email', 'first_name', 'last_name', 'username'] 

location_validator = RegexValidator(regex=r'^[a-zA-Z\s]*$', message='Enter a valid location name.')

class UserProfileSerializer(serializers.ModelSerializer):
    location = serializers.CharField(validators=[location_validator])
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['user', 'location', 'preferred_temperature_unit']

