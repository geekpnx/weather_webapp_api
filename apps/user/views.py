
from django.contrib.auth.models import User
from django.http import Http404

from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.authentication import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView

from .models import UserProfile
from .serializer import UserProfileSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]  # Allow anyone to access this endpoint

    def post(self, request):
        # Deny access if the user is already authenticated
        if request.user.is_authenticated:
            return Response({'error': 'Authenticated users cannot register again.'}, status=status.HTTP_403_FORBIDDEN)

        # Proceed with the registration process if the user is not authenticated
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        location = request.data.get('location')
        preferred_temperature_unit = request.data.get('preferred_temperature_unit')

        if not username or not password or not email:
            return Response({'error': 'Please provide all required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email)
        user_profile = UserProfile.objects.create(user=user, location=location, preferred_temperature_unit=preferred_temperature_unit)
        
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class UserProfileView(APIView):
    def get(self, request):
        try:
            # Try to get the user profile; if it doesn't exist, create one
            user_profile, created = UserProfile.objects.get_or_create(user=request.user)
            serializer = UserProfileSerializer(user_profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        try:
            user_profile, created = UserProfile.objects.get_or_create(user=request.user)
            data = request.data

            # Update the User model fields
            user = request.user
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.email = data.get('email', user.email)
            user.username = data.get('username', user.username)
            user.save()

            # Update the UserProfile model fields
            user_profile.location = data.get('location', user_profile.location)
            user_profile.preferred_temperature_unit = data.get('preferred_temperature_unit', user_profile.preferred_temperature_unit)
            user_profile.save()

            # Serialize the updated UserProfile
            serializer = UserProfileSerializer(user_profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)