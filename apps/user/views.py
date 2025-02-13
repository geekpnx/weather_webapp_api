from django.contrib.auth.models import User
from django.contrib.auth import logout

from rest_framework.authtoken.models import Token
from rest_framework.authentication import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import AllowAny

from .models import UserProfile
from .serializer import UserProfileSerializer
from django.shortcuts import get_object_or_404


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        # Do not perform CSRF check for API requests (Postman, etc.)
        return


class RegisterView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        if request.user.is_authenticated:
            Token.objects.filter(user=request.user).delete()
            logout(request)
            return Response({'message': 'You were logged out. Please try registering again.'}, status=status.HTTP_403_FORBIDDEN)

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
    
    def get_or_create_user_profile(self, user):
        """Helper method to get or create the user profile."""
        return get_object_or_404(UserProfile, user=user)

    def get(self, request):
        user_profile = self.get_or_create_user_profile(request.user)
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data)

    def put(self, request):
        user_profile = self.get_or_create_user_profile(request.user)
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
