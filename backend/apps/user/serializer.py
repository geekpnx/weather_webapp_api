from rest_framework import serializers
from django.conf import settings
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from apps.core.constants import PREFERRED_UNITS, THEME_CHOICES
from .models import UserProfile
import re

location_validator = RegexValidator(regex=r'^[a-zA-Z\s]*$', message='Enter a valid location name.')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(required=False)
    profile_picture = serializers.SerializerMethodField()
    location = serializers.CharField(validators=[location_validator])
    preferred_temperature_unit = serializers.ChoiceField(
        choices=PREFERRED_UNITS,
        default='C'
    )
    favorite_locations = serializers.JSONField(
        default=list,
        help_text="List of favorite locations"
    )
    preferred_theme = serializers.ChoiceField(
        choices=THEME_CHOICES,
        default='light'
    )

    class Meta:
        model = UserProfile
        fields = [
            'user', 
            'profile_picture', 
            'location', 
            'preferred_temperature_unit',
            'favorite_locations', 
            'preferred_theme'
        ]

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        
        if obj.profile_picture:
            if request:
                # Force HTTPS URL if the request is secure
                url = request.build_absolute_uri(obj.profile_picture.url)
                return url.replace('http://', 'https://') if request.is_secure() else url
            return f"{settings.MEDIA_URL}{obj.profile_picture.url.lstrip('/')}"
        
        # Default profile picture
        default_path = f"{settings.STATIC_URL}images/propic/user_propic.svg"
        if request:
            url = request.build_absolute_uri(default_path)
            return url.replace('http://', 'https://') if request.is_secure() else url
        return default_path
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        # Update User model
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Update UserProfile
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    
    def validate_location(self, value):
        if not re.match(r'^[a-zA-Z\s]*$', value):
            raise serializers.ValidationError("Enter a valid location name.")
        return value

