from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields= ['email', 'first_name', 'last_name', 'username'] 

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) # nested user data

    class Meta:
        model = UserProfile
        fields= ['user', 'location', 'preferred_temperature_unit']
